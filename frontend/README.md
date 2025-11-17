# Frontend - CineVinicius

Frontend React.js para aplicação de filmes.

## Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   ├── App.jsx        # Componente principal
│   │   └── Login.jsx      # Componente de login
│   ├── contexts/
│   │   ├── AppContext.jsx # Context API
│   │   └── appReducer.js  # Reducer para gerenciamento de estado
│   ├── utils/
│   │   └── api.js         # Funções de API
│   └── main.jsx           # Ponto de entrada
├── public/
└── package.json
```

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. (Opcional) Crie o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Para build de produção:
```bash
npm run build
```

## Funcionalidades

- ✅ Login
- ✅ Busca de filmes
- ✅ Inserção de filmes
- ✅ Favoritos (localStorage)
- ✅ Validação de campos
- ✅ Compressão de arquivos estáticos
- ✅ Context API para gerenciamento de estado
- ✅ useReducer para estado complexo

## Tecnologias

- React.js
- React Bootstrap
- Vite
- Context API
- useReducer

## Compressão

O build de produção inclui:
- Minificação de código
- Compressão de arquivos estáticos
- Code splitting (vendor, bootstrap)
- Remoção de console.log e debugger



