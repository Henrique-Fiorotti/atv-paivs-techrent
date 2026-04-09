// =============================================
// CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
// =============================================
// O mysql2 é usado por ter suporte a Promises (async/await),
// o que facilita muito o código assíncrono no Node.js.

const mysql = require('mysql2/promise');

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. ` +
        'Verifique seu arquivo backend/.env (veja backend/.env.example).'
    );
  }

  return value;
}

const dbConfig = {
  host: getRequiredEnv('DB_HOST'),
  port: getRequiredEnv('DB_PORT'),
  user: getRequiredEnv('DB_USER'),
  password: process.env.DB_PASSWORD || '',
  database: getRequiredEnv('DB_NAME'),
};

let ensureDatabasePromise = null;

async function ensureDatabaseExists() {
  if (ensureDatabasePromise) {
    return ensureDatabasePromise;
  }

  ensureDatabasePromise = (async () => {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    try {
      await connection.query('CREATE DATABASE IF NOT EXISTS ??', [dbConfig.database]);
      console.warn(`Banco "${dbConfig.database}" não existia e foi criado automaticamente.`);
    } finally {
      await connection.end();
    }
  })();

  try {
    await ensureDatabasePromise;
  } finally {
    ensureDatabasePromise = null;
  }
}

// Cria um "pool" de conexões.
// Um pool reutiliza conexões abertas ao invés de abrir uma nova a cada query,
// o que é mais eficiente e evita sobrecarregar o banco.
const pool = mysql.createPool({
  ...dbConfig,

  // Número máximo de conexões simultâneas no pool
  connectionLimit: 10,

  // Retorna valores numéricos como números JS (não como strings)
  typeCast: true,
});

async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      try {
        await ensureDatabaseExists();
        const [results] = await pool.execute(sql, params);
        return results;
      } catch (ensureError) {
        const message =
          `Banco de dados não encontrado: "${dbConfig.database}". ` +
          'Não foi possível criar automaticamente. Execute `bd/schema.sql` e `bd/views.sql` manualmente.';

        console.error(message);
        throw new Error(`${message} Motivo: ${ensureError.message}`);
      }
    }

    console.error('Erro na query:', error.message);
    throw error;
  }
}

module.exports = { pool, query };
