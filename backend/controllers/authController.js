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
const { UserModel } = require('../models/userModel');

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {
  const { nome, email, senha, nivel_acesso = 'cliente' } = req.body;
  const niveisPermitidos = ['cliente', 'admin', 'tecnico'];

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Campos nome, email e senha são obrigatórios.' });
    }

    if (!niveisPermitidos.includes(nivel_acesso)) {
      return res.status(400).json({ message: 'nivel_acesso inválido.' });
    }

    const emailExiste = await UserModel.encontrarPorEmail(email);
    if (emailExiste) {
      return res.status(400).json({ message: 'Email já existe' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const criarUsuario = await UserModel.criar(nome, email, senhaHash, nivel_acesso);
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
  const { email, senha } = req.body;
  try {
    if (!email || !senha) {
      return res.status(400).json({ message: 'Campos email e senha são obrigatórios.' });
    }

    const usuario = await UserModel.encontrarPorEmail(email);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET não configurado no ambiente.' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registro, login };
