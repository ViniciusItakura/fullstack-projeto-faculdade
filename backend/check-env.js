import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log('🔍 Verificando configuração do backend...\n');

const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  console.log('📝 Crie um arquivo .env na pasta backend/ com as seguintes variáveis:');
  console.log(`
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu-secret-super-seguro-aqui-mude-em-producao
JWT_EXPIRES_IN=24h
TMDB_API_KEY=sua-chave-api-tmdb-aqui
NODE_ENV=development
  `);
  process.exit(1);
}

console.log('✅ Arquivo .env encontrado\n');

const requiredVars = {
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || '3001',
};

let hasErrors = false;

if (!requiredVars.TMDB_API_KEY || requiredVars.TMDB_API_KEY === 'sua-chave-api-tmdb-aqui') {
  console.error('❌ TMDB_API_KEY não configurada ou está com valor padrão');
  console.log('   Obtenha uma chave em: https://www.themoviedb.org/settings/api');
  hasErrors = true;
} else {
  console.log('✅ TMDB_API_KEY configurada');
}

if (!requiredVars.JWT_SECRET || requiredVars.JWT_SECRET === 'seu-secret-super-seguro-aqui-mude-em-producao') {
  console.warn('⚠️  JWT_SECRET está com valor padrão (não recomendado para produção)');
} else {
  console.log('✅ JWT_SECRET configurada');
}

console.log(`✅ PORT: ${requiredVars.PORT}\n`);

if (hasErrors) {
  console.log('❌ Configure as variáveis de ambiente antes de continuar\n');
  process.exit(1);
}

console.log('✅ Todas as configurações estão corretas!\n');

