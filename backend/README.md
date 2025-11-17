# Backend - CineVinicius

Backend Express.js para aplicação de filmes.

## Estrutura

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js    # Configuração do banco de dados e pool de conexões
│   │   ├── cache.js       # Configuração do cache
│   │   └── logger.js      # Sistema de logs
│   ├── models/
│   │   ├── User.js        # Modelo de usuário
│   │   └── Movie.js       # Modelo de filme
│   ├── routes/
│   │   ├── auth.js        # Rotas de autenticação
│   │   └── movies.js      # Rotas de filmes
│   └── server.js          # Servidor principal
├── data/                  # Banco de dados SQLite (criado automaticamente)
├── logs/                  # Logs da aplicação (criado automaticamente)
└── package.json
```

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Crie o arquivo `.env`:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu-secret-super-seguro-aqui-mude-em-producao
JWT_EXPIRES_IN=24h
TMDB_API_KEY=sua-chave-api-tmdb-aqui
NODE_ENV=development
```

3. Execute o servidor:
```bash
npm start
# ou para desenvolvimento
npm run dev
```

## Funcionalidades

### Segurança
- ✅ Autenticação JWT
- ✅ Criptografia de senhas (bcryptjs)
- ✅ Rate limiting
- ✅ Sanitização de inputs
- ✅ Logs de segurança
- ✅ Helmet (headers de segurança)

### Otimizações
- ✅ Compressão de respostas (compression)
- ✅ Cache de buscas (node-cache)
- ✅ Pool de conexões (10 conexões SQLite)

### Validação
- ✅ Validação server-side (express-validator)
- ✅ Mensagens de erro detalhadas
- ✅ Sanitização de inputs

## Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Filmes
- `GET /api/movies/search?q={query}&page={page}` - Buscar filmes
- `POST /api/movies/insert` - Inserir filme
- `GET /api/movies/list?page={page}&limit={limit}` - Listar filmes inseridos

## Banco de Dados

O banco de dados SQLite é criado automaticamente na pasta `data/`. As tabelas são:

- `users` - Usuários do sistema
- `movies` - Filmes inseridos
- `search_logs` - Logs de buscas
- `auth_logs` - Logs de autenticação

## Logs

Os logs são salvos na pasta `logs/`:
- `app.log` - Logs gerais da aplicação
- `security.log` - Logs de segurança



