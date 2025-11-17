import NodeCache from 'node-cache';
import { logger } from './logger.js';

const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
});

export function getSearchCache(key) {
  return cache.get(`search:${key}`);
}

export function setSearchCache(key, value) {
  cache.set(`search:${key}`, value, 300);
}

export function clearCache(pattern = null) {
  if (pattern) {
    const keys = cache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => cache.del(key));
    logger.info(`Cache limpo para padrão: ${pattern}`);
  } else {
    cache.flushAll();
    logger.info('Todo o cache foi limpo');
  }
}

export function initCache() {
  logger.info('Cache inicializado');
}



