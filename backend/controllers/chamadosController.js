// =============================================
// CONTROLLER DE CHAMADOS
// =============================================
// TODO (alunos): implementar cada função abaixo.
//
// Fluxo de status:
//   aberto -> em_atendimento -> resolvido
//                           -> cancelado

const db = require('../config/database');

// GET /chamados - lista chamados
//   admin/técnico -> todos os chamados
//   cliente       -> apenas os seus (WHERE cliente_id = req.usuario.id)
const listar = async (req, res) => {
  const usuario = await UserModel.encontrarPorId(req.usuario.id);
};

// GET /chamados/:id - retorna um chamado pelo ID
const buscarPorId = async (req, res) => {
  
  // TODO
  res.status(200).json({ mensagem: `buscarPorId - ${db.query('SELECT * FROM chamados WHERE id = ?', [req.params.id])}` });
};

// POST /chamados - abre um novo chamado (cliente/admin)
// Body esperado: { titulo, descricao, equipamento_id, prioridade }
const criar = async (req, res) => {
  // TODO: inserir em chamados com cliente_id = req.usuario.id
  //       e atualizar equipamentos.status para 'em_manutencao'
  res.json({ mensagem: 'criar chamado - não implementado' });
};

// PUT /chamados/:id/status - atualiza o status do chamado (técnico/admin)
// Body esperado: { status, tecnico_id (opcional) }
const atualizarStatus = async (req, res) => {
  // TODO: ex: aberto -> em_atendimento -> resolvido
  //       ao resolver, atualizar equipamentos.status para 'operacional'
  res.json({ mensagem: 'atualizarStatus - não implementado' });
};

module.exports = { listar, buscarPorId, criar, atualizarStatus };
