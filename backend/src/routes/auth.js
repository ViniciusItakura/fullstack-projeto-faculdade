import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { logAuth, logger } from '../config/logger.js';
import { getConnection } from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui-mude-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username é obrigatório')
    .isLength({ min: 3, max: 50 }).withMessage('Username deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username deve conter apenas letras, números e underscore'),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
];

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuth(req.body.username, false, req);
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors.array(),
      });
    }

    const username = sanitizeInput(req.body.username);
    const password = req.body.password;

    const user = await User.findByUsername(username);
    
    if (!user) {
      logAuth(username, false, req);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      logAuth(username, false, req);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logAuth(username, true, req);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
    }
    req.user = user;
    next();
  });
}

export default router;



