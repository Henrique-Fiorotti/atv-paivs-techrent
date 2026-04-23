const jwt = require('jsonwebtoken');

function generateJWT({ id, nome, email, nivel_acesso }) {
  return jwt.sign(
    { id, nome, email, nivel_acesso },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function verifyJWT(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateJWT, verifyJWT };
