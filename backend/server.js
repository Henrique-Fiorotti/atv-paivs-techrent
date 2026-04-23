require('dotenv').config();

const express = require('express');
const apiRoutes = require('./routes');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', servico: 'TechRent API' });
});

app.use('/api', apiRoutes);
app.use(apiRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'TechRent API esta rodando!' });
});

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota nao encontrada.' });
});

const PORT = process.env.PORT || 8080;

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Erro no servidor:', error.message);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
