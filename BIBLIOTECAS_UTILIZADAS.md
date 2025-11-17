# Bibliotecas Utilizadas no Projeto

Este documento lista todas as bibliotecas externas utilizadas no projeto, separadas por backend e frontend.

## Backend

### Dependências Principais

1. **express** (^4.18.2)
   - Framework web para Node.js
   - Biblioteca padrão para desenvolvimento backend com Node.js
   - Uso: Servidor HTTP e definição de rotas

2. **better-sqlite3** (^9.2.2)
   - Driver SQLite para Node.js (síncrono)
   - Biblioteca padrão para acesso a banco de dados SQLite
   - Uso: Conexão e operações no banco de dados SQLite

3. **bcryptjs** (^2.4.3)
   - Implementação JavaScript do bcrypt para hash de senhas
   - Biblioteca padrão para criptografia de senhas
   - Uso: Hash e verificação de senhas de usuários

4. **jsonwebtoken** (^9.0.2)
   - Implementação de JSON Web Tokens
   - Biblioteca padrão para autenticação JWT
   - Uso: Geração e verificação de tokens de autenticação

5. **express-validator** (^7.0.1)
   - Middleware de validação para Express
   - Biblioteca padrão para validação de dados
   - Uso: Validação e sanitização de inputs da API

6. **express-rate-limit** (^7.1.5)
   - Middleware de rate limiting para Express
   - Biblioteca padrão para prevenção de ataques de força bruta
   - Uso: Limitação de requisições por IP

7. **helmet** (^7.1.0)
   - Middleware de segurança HTTP para Express
   - Biblioteca padrão para configuração de headers de segurança
   - Uso: Configuração de headers de segurança (CSP, etc.)

8. **compression** (^1.7.4)
   - Middleware de compressão para Express
   - Biblioteca padrão para compressão de respostas HTTP
   - Uso: Compressão gzip/deflate das respostas do servidor

9. **cors** (^2.8.5)
   - Middleware CORS para Express
   - Biblioteca padrão para configuração de CORS
   - Uso: Configuração de Cross-Origin Resource Sharing

10. **node-cache** (^5.1.2)
    - Sistema de cache em memória para Node.js
    - Biblioteca padrão para cache de dados
    - Uso: Cache de resultados de buscas de filmes

11. **dotenv** (^16.3.1)
    - Carregador de variáveis de ambiente
    - Biblioteca padrão para gerenciamento de variáveis de ambiente
    - Uso: Carregamento de variáveis de ambiente do arquivo .env

### Bibliotecas Nativas do Node.js (não requerem instalação)

- **crypto**: Criptografia nativa (hash de tokens)
- **fs**: Sistema de arquivos (logs)
- **path**: Manipulação de caminhos
- **url**: Manipulação de URLs

## Frontend

### Dependências Principais

1. **react** (^18.3.1)
   - Biblioteca JavaScript para construção de interfaces
   - Biblioteca padrão para desenvolvimento frontend React
   - Uso: Componentes React e gerenciamento de estado

2. **react-dom** (^18.3.1)
   - Renderizador React para DOM
   - Biblioteca padrão do ecossistema React
   - Uso: Renderização de componentes React no DOM

3. **react-bootstrap** (^2.10.10)
   - Componentes Bootstrap para React
   - Biblioteca padrão de componentes UI para React
   - Uso: Componentes de interface (Button, Card, Form, etc.)

4. **bootstrap** (^5.3.3)
   - Framework CSS
   - Biblioteca padrão de estilos CSS
   - Uso: Estilos e grid system

### Dependências de Desenvolvimento

1. **vite** (^5.4.8)
   - Build tool e dev server
   - Ferramenta padrão para projetos React modernos
   - Uso: Build e servidor de desenvolvimento

2. **@vitejs/plugin-react** (^4.3.1)
   - Plugin React para Vite
   - Plugin oficial do Vite para React
   - Uso: Suporte a JSX e React no Vite

## Observações

- Todas as bibliotecas utilizadas são padrão e amplamente utilizadas na comunidade de desenvolvimento web
- Nenhuma biblioteca não autorizada ou exótica foi utilizada
- As bibliotecas nativas do Node.js não requerem aprovação prévia
- Todas as dependências estão listadas nos arquivos `package.json` respectivos

## Autorização do Professor

Todas as bibliotecas listadas acima são bibliotecas padrão e comumente utilizadas em projetos acadêmicos similares. Solicitamos a aprovação prévia do professor para a utilização destas bibliotecas.

