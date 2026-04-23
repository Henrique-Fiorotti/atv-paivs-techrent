const { verifyJWT } = require('../utils/jwtUtils');

const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Token nao fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Formato de token invalido.' });
  }

  try {
    req.usuario = verifyJWT(token);
    return next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token invalido ou expirado.' });
  }
};

const autorizar = (...niveis) => {
  return (req, res, next) => {
    if (!niveis.includes(req.usuario.nivel_acesso)) {
      return res.status(403).json({ mensagem: 'Acesso negado. Permissao insuficiente.' });
    }

    return next();
  };
};

module.exports = { autenticar, autorizar };
