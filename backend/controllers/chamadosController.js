// =============================================
// CONTROLLER DE CHAMADOS
// =============================================
// TODO (alunos): implementar cada função abaixo.
//
// Fluxo de status:
//   aberto -> em_atendimento -> resolvido
//                           -> cancelado

const db = require('../config/database');
const { ChamadosModel } = require('../models/chamadosModel');

// GET /chamados - lista chamados
//   admin/técnico -> todos os chamados
//   cliente       -> apenas os seus (WHERE cliente_id = req.usuario.id)
const listar = async (req, res) => {

  try {
    const chamados = await ChamadosModel.listar();

    if (!chamados || chamados.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhum chamado encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ erro: error.message })
  }
};

// GET /chamados/:id - retorna um chamado pelo ID
const buscarPorId = async (req, res) => {

};

// POST /chamados - abre um novo chamado (cliente/admin)
// Body esperado: { titulo, descricao, equipamento_id, prioridade }
const criar = async (req, res) => {
  // TODO: inserir em chamados com cliente_id = req.usuario.id
  //       e atualizar equipamentos.status para 'em_manutencao'
  try {
    const { id } = req.params;
    const dados = req.body;

    const criado  = await ChamadosModel.criar(id, dados);

    if(!criado){
      res.status(400).json({message: 'Não foi possível criar o Chamado'})
    }

    res.status(201).json({message: 'Chamado criado'})
  } catch (error) {
    res.status(500).json({erro: error.message})
  }
};

// PUT /chamados/:id/status - atualiza o status do chamado (técnico/admin)
// Body esperado: { status, tecnico_id (opcional) }
const atualizarStatus = async (req, res) => {

  try {
    const { id } = req.params;
    const dados = req.body;

    const atualizado = await ChamadosModel.atualizar(id, dados);

    if(!atualizado){
      res.status(400).json({message: 'Chamado não encontrado'});
    }

    res.status(200).json({message: 'Chamado atualizado'});
  } catch (error) {
    res.status(500).json({erro: error.message})
  }
};

module.exports = { listar, buscarPorId, criar, atualizarStatus };
