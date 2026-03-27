// =============================================
// CONTROLLER DE AUTENTICAÇÃO
// =============================================
// TODO (alunos): implementar as funções registro e login.
//
// Dicas:
//   - Use bcryptjs para criptografar a senha antes de salvar (registro)
//   - Use bcryptjs para comparar a senha no login (bcrypt.compare)
//   - Use jsonwebtoken (jwt.sign) para gerar o token após login bem-sucedido
//   - O payload do token deve ter: id, nome, email, nivel_acesso
//   - NUNCA coloque a senha no payload do token!

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { UserModel } = require('../models/userModel');

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {

  const { nome, email, senha, nivel_acesso } = req.body

  try {

    const emailExiste = await UserModel.encontrarPorEmail(email);
    if (emailExiste) {
      return res.status(400).json({ message: 'Email já existe' });
    }

    const criarUsuario = await UserModel.criar(nome, email, senha, nivel_acesso)
    if (criarUsuario) {
      return res.status(201).json({ message: 'Usuário criado com sucesso' });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// POST /auth/login - autentica e retorna JWT
const login = async (req, res) => {
  // TODO
  res.json({ message: 'login - não implementado' });
};

module.exports = { registro, login };
