// =============================================
// PONTO DE ENTRADA DO SERVIDOR
// =============================================
// Este é o arquivo principal. Ele:
//   1. Carrega as variáveis de ambiente (.env)
//   2. Configura o Express e seus middlewares globais
//   3. Registra as rotas da aplicação
//   4. Inicia o servidor na porta definida no .env

// dotenv deve ser o PRIMEIRO require, para que as variáveis
// fiquem disponíveis em todos os outros módulos
require('dotenv').config();

const express = require('express');
const apiRoutes = require('./routes');

const app = express();

// ---- Middlewares globais ----

// Permite que o Express leia o corpo das requisições em JSON
app.use(express.json());

// ---- Registro das rotas ----
// Todas as rotas de negócio ficam sob o prefixo /api
app.use('/api', apiRoutes);

// ---- Rota de health check ----
// Útil para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.json({ mensagem: 'TechRent API está rodando!' });
});

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// ---- Inicialização do servidor ----
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
