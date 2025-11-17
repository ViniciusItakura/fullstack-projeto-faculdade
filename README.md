# Projeto Fullstack - CineVinicius

Aplicação fullstack para busca e gerenciamento de filmes utilizando a API do TMDB.

## Estrutura do Projeto

```
fullstack-faculdade/
├── backend/          # Backend Express.js
│   ├── src/
│   │   ├── config/   # Configurações (database, cache, logger)
│   │   ├── models/   # Modelos de dados
│   │   ├── routes/   # Rotas da API
│   │   └── server.js # Servidor principal
│   └── package.json
├── frontend/         # Frontend React.js
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Funcionalidades

### Backend
- ✅ Login com JWT
- ✅ Busca de filmes (TMDB API)
- ✅ Inserção de filmes
- ✅ Validação server-side
- ✅ Compressão de respostas
- ✅ Cache de buscas
- ✅ Pool de conexões do banco de dados
- ✅ Logs de segurança e autenticação
- ✅ Rate limiting
- ✅ Sanitização de inputs (prevenção de XSS e SQL Injection)

### Frontend
- ✅ Login
- ✅ Busca de filmes
- ✅ Inserção de filmes
- ✅ Favoritos (localStorage)
- ✅ Validação de campos
- ✅ Compressão de arquivos estáticos

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Chave de API do TMDB (obtenha em https://www.themoviedb.org/)

## Instalação

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu-secret-super-seguro-aqui-mude-em-producao
JWT_EXPIRES_IN=24h
TMDB_API_KEY=sua-chave-api-tmdb-aqui
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env` na pasta `frontend/` (opcional):

```env
VITE_API_URL=http://localhost:3001/api
```

## Execução

### Backend

```bash
cd backend
npm start
# ou para desenvolvimento com watch
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará rodando em `http://localhost:5173`

## Usuários de Teste

O sistema vem com os seguintes usuários pré-cadastrados:

- **admin** / admin123
- **user** / user123
- **test** / test123

## Segurança Implementada

1. **Criptografia de senhas**: bcryptjs
2. **Tokens JWT**: Autenticação stateless
3. **HTTPS**: Configurado para produção (Helmet)
4. **Sanitização de inputs**: Prevenção de XSS e SQL Injection
5. **Rate Limiting**: Prevenção de ataques de força bruta
6. **Logs de segurança**: Registro de tentativas de login e buscas
7. **Validação server-side**: Validação de todos os inputs

## Otimizações

1. **Compressão de respostas**: Middleware compression
2. **Cache**: Cache de buscas (5 minutos) e filmes (1 hora)
3. **Pool de conexões**: Pool de 10 conexões SQLite
4. **Compressão de arquivos estáticos**: Minificação e compressão no build

## Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Filmes

- `GET /api/movies/search?q={query}&page={page}` - Buscar filmes
- `POST /api/movies/insert` - Inserir filme
- `GET /api/movies/list?page={page}&limit={limit}` - Listar filmes inseridos

## Tecnologias

### Backend
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- compression
- helmet
- express-rate-limit
- node-cache

### Frontend
- React.js
- React Bootstrap
- Vite
- Context API
- useReducer

## Autor

Vinicius Enrique Pinheiro Itakura

## Licença

Este projeto foi desenvolvido para fins educacionais.



