import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from './auth.js';
import { Movie } from '../models/Movie.js';
import { logSearch } from '../config/logger.js';
import { getConnection } from '../config/database.js';
import { getSearchCache, setSearchCache, clearCache } from '../config/cache.js';
import { logger } from '../config/logger.js';

const router = express.Router();
const getTMDBAPIKey = () => process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

router.use(authenticateToken);

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

const validateSearch = [
  query('q')
    .notEmpty().withMessage('Termo de busca é obrigatório')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Termo de busca deve ter entre 2 e 100 caracteres'),
  query('page')
    .optional()
    .toInt()
    .isInt({ min: 1, max: 500 }).withMessage('Página deve ser um número entre 1 e 500'),
];

router.get('/search', validateSearch, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors.array(),
      });
    }

    const TMDB_API_KEY = getTMDBAPIKey();
    if (!TMDB_API_KEY) {
      logger.error('TMDB_API_KEY não configurada');
      return res.status(500).json({
        success: false,
        message: 'Chave da API do TMDB não configurada',
        error: 'Configure a variável de ambiente TMDB_API_KEY',
      });
    }

    const searchQuery = String(req.query.q || '').trim();
    const page = parseInt(req.query.page) || 1;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Termo de busca é obrigatório',
      });
    }

    const cacheKey = `${searchQuery}:${page}`;
    const cachedResult = getSearchCache(cacheKey);
    if (cachedResult) {
      logger.info(`Cache hit para busca: ${searchQuery}`);
      logSearch(req.user.userId, searchQuery, cachedResult.results?.length || 0, req);
      return res.json(cachedResult);
    }

    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('query', searchQuery);
    url.searchParams.set('page', String(page));
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('language', 'pt-BR');

    logger.info(`Buscando filmes na TMDB: ${searchQuery} (página ${page})`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`TMDB API error ${response.status}: ${errorText}`);
      
      if (response.status === 401) {
        return res.status(500).json({
          success: false,
          message: 'Chave da API do TMDB inválida',
          error: 'Verifique a configuração da variável TMDB_API_KEY',
        });
      }
      
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Resposta inválida da API do TMDB');
    }

    const results = data.results || [];
    const totalPages = Math.min(data.total_pages || 0, 500);

    const responseData = {
      success: true,
      results: results.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      })),
      page: data.page || page,
      totalPages,
      totalResults: data.total_results || 0,
    };

    setSearchCache(cacheKey, responseData);

    logSearch(req.user.userId, searchQuery, results.length, req);

    res.json(responseData);
  } catch (error) {
    logger.error('Erro na busca:', error);
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao conectar com a API do TMDB',
        error: 'Verifique sua conexão com a internet',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar filmes',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

const validateInsert = [
  body('tmdb_id')
    .notEmpty().withMessage('TMDB ID é obrigatório')
    .isInt({ min: 1 }).withMessage('TMDB ID deve ser um número válido'),
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ min: 1, max: 500 }).withMessage('Título deve ter entre 1 e 500 caracteres'),
  body('overview')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Sinopse deve ter no máximo 2000 caracteres'),
  body('poster_path')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Caminho do poster inválido'),
  body('release_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de lançamento deve estar no formato YYYY-MM-DD'),
  body('vote_average')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Nota média deve ser um número entre 0 e 10'),
];

router.post('/insert', validateInsert, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors.array(),
      });
    }

    const db = getConnection();
    const userId = req.user.userId;

    const movieData = {
      id: parseInt(req.body.tmdb_id),
      title: sanitizeInput(req.body.title),
      overview: req.body.overview ? sanitizeInput(req.body.overview) : null,
      poster_path: req.body.poster_path ? sanitizeInput(req.body.poster_path) : null,
      release_date: req.body.release_date || null,
      vote_average: req.body.vote_average ? parseFloat(req.body.vote_average) : null,
    };

    const existingMovie = await Movie.findByTmdbId(movieData.id);
    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: 'Filme já cadastrado no sistema',
      });
    }

    const movieId = await Movie.create(movieData, userId);

    clearCache('search:');
    
    logger.info(`Filme inserido: ${movieData.title} (ID: ${movieId})`);

    res.status(201).json({
      success: true,
      message: 'Filme inserido com sucesso',
      movieId,
    });
  } catch (error) {
    logger.error('Erro ao inserir filme:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao inserir filme',
      error: error.message,
    });
  }
});

export default router;

