const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { generateJWT } = require('../utils/jwtUtils');

const NIVEIS_ACESSO = ['cliente', 'admin', 'tecnico'];

class AuthController {
  static async register(req, res) {
    try {
      const nome = req.body.nome?.trim();
      const email = req.body.email?.trim().toLowerCase();
      const senha = req.body.senha;
      const nivel_acesso = req.body.nivel_acesso || 'cliente';

      if (!nome || !email || !senha) {
        return res
          .status(400)
          .json({ mensagem: 'Campos nome, email e senha sao obrigatorios.' });
      }

      if (!NIVEIS_ACESSO.includes(nivel_acesso)) {
        return res.status(400).json({ mensagem: 'Nivel de acesso invalido.' });
      }

      const usuarioExistente = await UserModel.findByEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({ mensagem: 'Ja existe um usuario com este email.' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const usuarioId = await UserModel.create({
        nome,
        email,
        senha: senhaHash,
        nivel_acesso,
      });

      return res.status(201).json({
        mensagem: 'Usuario criado com sucesso.',
        usuario: {
          id: usuarioId,
          nome,
          email,
          nivel_acesso,
        },
      });
    } catch (error) {
      console.error('Erro ao registrar usuario:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async login(req, res) {
    try {
      const email = req.body.email?.trim().toLowerCase();
      const senha = req.body.senha;

      if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Campos email e senha sao obrigatorios.' });
      }

      const usuario = await UserModel.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ mensagem: 'Credenciais invalidas.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ mensagem: 'Credenciais invalidas.' });
      }

      const usuarioSemSenha = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      };

      const token = generateJWT(usuarioSemSenha);

      return res.status(200).json({
        mensagem: 'Usuario logado com sucesso.',
        usuario: usuarioSemSenha,
        token,
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }
}

module.exports = AuthController;
