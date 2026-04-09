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
    const { nivel_acesso, id: usuarioId } = req.usuario;
    const chamados = nivel_acesso === 'cliente'
      ? await ChamadosModel.listarPorCliente(usuarioId)
      : await ChamadosModel.listar();

    return res.status(200).json(chamados);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// GET /chamados/:id - retorna um chamado pelo ID
const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { nivel_acesso, id: usuarioId } = req.usuario;
    const chamado = await ChamadosModel.buscarDetalhadoPorId(id);

    if (!chamado) {
      return res.status(404).json({ mensagem: 'Chamado não encontrado' });
    }

    if (nivel_acesso === 'cliente' && chamado.cliente_id !== usuarioId) {
      return res.status(403).json({ mensagem: 'Acesso negado para este chamado.' });
    }

    return res.status(200).json(chamado);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// POST /chamados - abre um novo chamado (cliente/admin)
// Body esperado: { titulo, descricao, equipamento_id, prioridade }
const criar = async (req, res) => {
  try {
    const { titulo, descricao, equipamento_id, prioridade = 'media' } = req.body;
    const clienteId = req.usuario.id;

    if (!titulo || !equipamento_id) {
      return res.status(400).json({ message: 'Campos titulo e equipamento_id são obrigatórios.' });
    }

    const equipamento = await db.query('SELECT id, status FROM equipamentos WHERE id = ?', [equipamento_id]);
    if (equipamento.length === 0) {
      return res.status(404).json({ message: 'Equipamento não encontrado.' });
    }

    if (equipamento[0].status !== 'operacional') {
      return res.status(400).json({ message: 'Equipamento não está operacional para abertura de chamado.' });
    }

    const chamadoId = await ChamadosModel.criar(
      titulo,
      descricao || null,
      clienteId,
      equipamento_id,
      null,
      prioridade,
      'aberto'
    );

    await db.query(`UPDATE equipamentos SET status = 'em_manutencao' WHERE id = ?`, [equipamento_id]);

    return res.status(201).json({ message: 'Chamado criado', chamado_id: chamadoId });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// PUT /chamados/:id/status - atualiza o status do chamado (técnico/admin)
// Body esperado: { status, tecnico_id (opcional) }
const atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { nivel_acesso, id: usuarioId } = req.usuario;
    const chamadoAtual = await ChamadosModel.findById(id);

    if (!chamadoAtual) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    const transicoesPermitidas = {
      aberto: ['em_atendimento', 'cancelado'],
      em_atendimento: ['resolvido', 'cancelado'],
      resolvido: [],
      cancelado: []
    };

    if (!status || !transicoesPermitidas[chamadoAtual.status]?.includes(status)) {
      return res.status(400).json({ message: `Transição inválida: ${chamadoAtual.status} -> ${status}` });
    }

    const tecnicoId = nivel_acesso === 'tecnico' ? usuarioId : (req.body.tecnico_id ?? chamadoAtual.tecnico_id);
    const atualizado = await ChamadosModel.atualizar(id, {
      descricao: chamadoAtual.descricao,
      prioridade: chamadoAtual.prioridade,
      tecnico_id: tecnicoId,
      status
    });

    if (!atualizado) {
      return res.status(400).json({ message: 'Falha ao atualizar chamado' });
    }

    if (status === 'cancelado' && chamadoAtual.equipamento_id) {
      await db.query(`UPDATE equipamentos SET status = 'operacional' WHERE id = ?`, [chamadoAtual.equipamento_id]);
    }

    return res.status(200).json({ message: 'Chamado atualizado' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizarStatus };
