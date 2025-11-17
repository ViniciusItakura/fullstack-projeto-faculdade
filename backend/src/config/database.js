import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from './logger.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const POOL_SIZE = 5;
const connectionPool = [];
let currentConnectionIndex = 0;

function createConnectionPool() {
  for (let i = 0; i < POOL_SIZE; i++) {
    const db = new Database(join(__dirname, '../../data/database.sqlite'), {
      verbose: process.env.NODE_ENV === 'development' 
        ? (sql) => logger.debug('SQL:', sql) 
        : null,
      timeout: 5000,
    });
    
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 10000');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    
    connectionPool.push(db);
  }
  logger.info(`Pool de conexões criado com ${POOL_SIZE} conexões`);
}

export function getConnection() {
  const connection = connectionPool[currentConnectionIndex];
  currentConnectionIndex = (currentConnectionIndex + 1) % POOL_SIZE;
  return connection;
}

export function closeConnections() {
  connectionPool.forEach(db => {
    try {
      db.close();
    } catch (error) {
      logger.error('Erro ao fechar conexão:', error);
    }
  });
  logger.info('Todas as conexões foram fechadas');
}

export async function initDatabase() {
  const fs = await import('fs/promises');
  const dataDir = join(__dirname, '../../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  createConnectionPool();

  const db = getConnection();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      overview TEXT,
      poster_path TEXT,
      release_date TEXT,
      vote_average REAL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS search_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      query TEXT NOT NULL,
      results_count INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS auth_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      success INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS insert_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      movie_id INTEGER,
      movie_title TEXT,
      success INTEGER NOT NULL,
      error_message TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS token_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
    CREATE INDEX IF NOT EXISTS idx_movies_created_by ON movies(created_by);
    CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_logs_username ON auth_logs(username);
    CREATE INDEX IF NOT EXISTS idx_insert_logs_user_id ON insert_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_hash ON token_blacklist(token_hash);
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const defaultUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'user', password: 'user123' },
      { username: 'test', password: 'test123' },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (username, password) 
      VALUES (?, ?)
    `);

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      insertUser.run(user.username, hashedPassword);
    }

    logger.info(`${defaultUsers.length} usuários padrão criados`);
  }

  logger.info('Banco de dados inicializado com sucesso');
}

