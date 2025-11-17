# BizScan – Consulta de CNPJ (Fase 2/2)

Aplicação em **React (Vite)** para consultar empresas brasileiras pelo **CNPJ** usando a **API pública OpenCNPJ**.  
Trabalho da disciplina **Desenvolvimento Web Fullstack – UTFPR**.

---

## Funcionalidades Implementadas

### Login
- Autenticação com JWT
- Validação de credenciais
- Rate limiting para prevenir ataques de força bruta
- Logs de tentativas de login

### Busca de Empresas
- Busca por CNPJ com validação
- Cache em memória (5 minutos)
- Cache persistente no banco de dados
- Fallback para API externa (OpenCNPJ)
- Logs de todas as buscas

### Inserção de Empresas
- Formulário com validação
- Sanitização de inputs
- Logs de inserções
- Atualização do cache

### Segurança Implementada
- ✅ Helmet para headers de segurança
- ✅ Rate limiting (100 req/15min geral, 5 tentativas de login/15min)
- ✅ Express Validator para sanitização de inputs
- ✅ Senhas criptografadas com bcrypt
- ✅ Tokens JWT com expiração (1 hora)
- ✅ Blacklist de tokens no logout
- ✅ Validação de CNPJ no servidor
- ✅ CORS configurado

### Otimizações
- ✅ Compressão de respostas HTTP (gzip)
- ✅ Compressão de assets estáticos (gzip e brotli)
- ✅ Cache em memória com TTL
- ✅ Pool de conexões do Prisma
- ✅ Minificação de código em produção

### Logs
- ✅ Logs de autenticação (sucesso e erro)
- ✅ Logs de buscas
- ✅ Logs de inserções
- Arquivos salvos em `backend/logs/app.log`

---

## Tecnologias
- React + Vite  
- Material UI (MUI)  
- Context API (`CnpjContext`)  
- `useMemo` para normalização/validação do CNPJ  

---

## Como rodar localmente

## Pré-requisitos

- Node.js (versão 18 ou superior)
- MySQL (versão 8 ou superior)
- npm ou yarn

## Configuração do Banco de Dados

1. Certifique-se de que o MySQL esteja rodando
2. Crie um banco de dados chamado `bizscan`:
   ```sql
   CREATE DATABASE bizscan;
   ```

## Configuração do Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Edite o arquivo `.env` com suas credenciais do MySQL:
     ```
     FRONTEND_URL=http://localhost:5173
     PORT=3000
     JWT_SECRET=your_secret_key_here
     DATABASE_URL=mysql://user:password@localhost:3306/bizscan
     ```

4. Execute as migrations do Prisma:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Execute o seed para criar usuários de teste:
   ```bash
   npm run prisma:seed
   ```

   Usuários criados:
   - Email: `teste@example.com` | Senha: `senha123`
   - Email: `admin@example.com` | Senha: `teste456`

6. Inicie o servidor:
   ```bash
   npm start
   ```

   O backend estará rodando em `http://localhost:3000`

## Configuração do Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. (Opcional) Configure a URL da API:
   - Crie um arquivo `.env` na raiz do frontend
   - Adicione a URL do backend (padrão já está configurado):
     ```
     VITE_API_URL=http://localhost:3000/api
     ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

   O frontend estará rodando em `http://localhost:5173`

## Executando o Projeto

1. Certifique-se de que o MySQL está rodando
2. Inicie o backend (terminal 1):
   ```bash
   cd backend
   npm start
   ```

3. Inicie o frontend (terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

4. Acesse `http://localhost:5173` no navegador