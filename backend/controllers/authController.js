const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/userModel');
const { NIVEIS_ACESSO, normalizarTexto } = require('../constants/workflow');

function obterTokenBearer(authHeader) {
  if (!authHeader) {
    return null;
  }

  const [tipo, token] = authHeader.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function obterAdminAutenticado(req) {
  const token = obterTokenBearer(req.headers.authorization);

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload?.nivel_acesso === 'admin' ? payload : null;
  } catch (error) {
    return null;
  }
}

function montarPayloadUsuario(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    nivel_acesso: usuario.nivel_acesso,
  };
}

const registro = async (req, res) => {
  const nome = normalizarTexto(req.body.nome);
  const email = normalizarTexto(req.body.email)?.toLowerCase();
  const senha = req.body.senha;
  const nivelSolicitado = req.body.nivel_acesso || 'cliente';

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Campos nome, email e senha sao obrigatorios.' });
    }

    if (!NIVEIS_ACESSO.includes(nivelSolicitado)) {
      return res.status(400).json({ mensagem: 'nivel_acesso invalido.' });
    }

    if (nivelSolicitado !== 'cliente' && !obterAdminAutenticado(req)) {
      return res.status(403).json({
        mensagem: 'Somente administradores autenticados podem cadastrar usuarios com perfil admin ou tecnico.',
      });
    }

    const emailExistente = await UserModel.encontrarPorEmail(email);
    if (emailExistente) {
      return res.status(409).json({ mensagem: 'Ja existe um usuario cadastrado com este email.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuarioId = await UserModel.criar(nome, email, senhaHash, nivelSolicitado);

    return res.status(201).json({
      mensagem: 'Usuario criado com sucesso.',
      usuario: {
        id: novoUsuarioId,
        nome,
        email,
        nivel_acesso: nivelSolicitado,
      },
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const login = async (req, res) => {
  const email = normalizarTexto(req.body.email)?.toLowerCase();
  const senha = req.body.senha;

  try {
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Campos email e senha sao obrigatorios.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ mensagem: 'JWT_SECRET nao configurado no ambiente.' });
    }

    const usuario = await UserModel.encontrarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Email ou senha invalidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Email ou senha invalidos.' });
    }

    const payload = montarPayloadUsuario(usuario);
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: payload,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

module.exports = { registro, login };
