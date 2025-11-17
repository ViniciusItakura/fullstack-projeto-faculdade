import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConnection } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOG_DIR = join(__dirname, '../../logs');
const LOG_FILE = join(LOG_DIR, 'app.log');

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

function getTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
}

function writeLog(level, message, data = null) {
  const logMessage = formatMessage(level, message, data);
  
  console.log(logMessage.trim());
  
  try {
    appendFileSync(LOG_FILE, logMessage);
  } catch (error) {
    console.error('Erro ao escrever no log:', error);
  }
}

export const logger = {
  info: (message, data = null) => writeLog('INFO', message, data),
  error: (message, error = null) => {
    const errorData = error ? {
      message: error?.message || String(error),
      stack: error?.stack,
    } : null;
    writeLog('ERROR', message, errorData);
  },
  warn: (message, data = null) => writeLog('WARN', message, data),
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('DEBUG', message, data);
    }
  },
};

export function logSecurityEvent(type, details) {
  const securityLog = join(LOG_DIR, 'security.log');
  const message = formatMessage('SECURITY', type, details);
  try {
    appendFileSync(securityLog, message);
  } catch (error) {
    console.error('Erro ao escrever no log de segurança:', error);
  }
}

export function logAuth(username, success, req) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  
  logSecurityEvent('AUTH_ATTEMPT', {
    username,
    success,
    ip,
    userAgent,
  });
  
  setImmediate(() => {
    try {
      const logDb = getConnection();
      const insertLog = logDb.prepare(`
        INSERT INTO auth_logs (username, success, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `);
      
      insertLog.run(
        username || null,
        success ? 1 : 0,
        ip,
        userAgent
      );
    } catch (error) {
      if (error.message && error.message.includes('locked')) {
        setTimeout(() => {
          try {
            const retryDb = getConnection();
            const insertLog = retryDb.prepare(`
              INSERT INTO auth_logs (username, success, ip_address, user_agent)
              VALUES (?, ?, ?, ?)
            `);
            insertLog.run(
              username || null,
              success ? 1 : 0,
              ip,
              userAgent
            );
          } catch (retryError) {
            logger.warn('Falha ao registrar log de autenticação após retry:', retryError.message);
          }
        }, 200);
      } else {
        logger.warn('Erro ao registrar log de autenticação:', error.message);
      }
    }
  });
}

export function logSearch(userId, query, resultsCount, req) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  
  setImmediate(() => {
    try {
      const logDb = getConnection();
      const insertLog = logDb.prepare(`
        INSERT INTO search_logs (user_id, query, results_count, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      insertLog.run(
        userId || null,
        query,
        resultsCount || 0,
        ip,
        userAgent
      );
    } catch (error) {
      if (error.message && error.message.includes('locked')) {
        setTimeout(() => {
          try {
            const retryDb = getConnection();
            const insertLog = retryDb.prepare(`
              INSERT INTO search_logs (user_id, query, results_count, ip_address, user_agent)
              VALUES (?, ?, ?, ?, ?)
            `);
            insertLog.run(
              userId || null,
              query,
              resultsCount || 0,
              ip,
              userAgent
            );
          } catch (retryError) {
            logger.warn('Falha ao registrar log de busca após retry:', retryError.message);
          }
        }, 200);
      } else {
        logger.warn('Erro ao registrar log de busca:', error.message);
      }
    }
  });
}

export function logInsert(userId, movieId, movieTitle, success, errorMessage, req) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  
  setImmediate(() => {
    try {
      const logDb = getConnection();
      const insertLog = logDb.prepare(`
        INSERT INTO insert_logs (user_id, movie_id, movie_title, success, error_message, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertLog.run(
        userId || null,
        movieId || null,
        movieTitle || null,
        success ? 1 : 0,
        errorMessage || null,
        ip,
        userAgent
      );
    } catch (error) {
      if (error.message && error.message.includes('locked')) {
        setTimeout(() => {
          try {
            const retryDb = getConnection();
            const insertLog = retryDb.prepare(`
              INSERT INTO insert_logs (user_id, movie_id, movie_title, success, error_message, ip_address, user_agent)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            insertLog.run(
              userId || null,
              movieId || null,
              movieTitle || null,
              success ? 1 : 0,
              errorMessage || null,
              ip,
              userAgent
            );
          } catch (retryError) {
            logger.warn('Falha ao registrar log de inserção após retry:', retryError.message);
          }
        }, 200);
      } else {
        logger.warn('Erro ao registrar log de inserção:', error.message);
      }
    }
  });
}

