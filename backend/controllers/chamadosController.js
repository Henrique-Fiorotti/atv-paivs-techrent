const { pool } = require('../config/database');
const { ChamadosModel } = require('../models/chamadosModel');
const {
  PRIORIDADES_CHAMADO,
  TRANSICOES_STATUS_CHAMADO,
  normalizarTexto,
  normalizarTextoOpcional,
  paraIdInteiro,
} = require('../constants/workflow');

async function buscarTecnicoValido(tecnicoId, connection) {
  const [tecnicos] = await connection.execute(
    'SELECT id, nome, nivel_acesso FROM usuarios WHERE id = ?',
    [tecnicoId]
  );

  const tecnico = tecnicos[0];
  if (!tecnico || tecnico.nivel_acesso !== 'tecnico') {
    return null;
  }

  return tecnico;
}

const listar = async (req, res) => {
  try {
    const { nivel_acesso, id: usuarioId } = req.usuario;
    const chamados =
      nivel_acesso === 'cliente'
        ? await ChamadosModel.listarPorCliente(usuarioId)
        : await ChamadosModel.listar();

    return res.status(200).json(chamados);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const id = paraIdInteiro(req.params.id);
    if (!id) {
      return res.status(400).json({ mensagem: 'ID de chamado invalido.' });
    }

    const { nivel_acesso, id: usuarioId } = req.usuario;
    const chamado = await ChamadosModel.buscarDetalhadoPorId(id);

    if (!chamado) {
      return res.status(404).json({ mensagem: 'Chamado nao encontrado.' });
    }

    if (nivel_acesso === 'cliente' && chamado.cliente_id !== usuarioId) {
      return res.status(403).json({ mensagem: 'Acesso negado para este chamado.' });
    }

    return res.status(200).json(chamado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const criar = async (req, res) => {
  const titulo = normalizarTexto(req.body.titulo);
  const descricao = normalizarTextoOpcional(req.body.descricao);
  const equipamentoId = paraIdInteiro(req.body.equipamento_id);
  const prioridade = req.body.prioridade || 'media';
  const clienteId = req.usuario.id;

  if (!titulo || !equipamentoId) {
    return res
      .status(400)
      .json({ mensagem: 'Campos titulo e equipamento_id sao obrigatorios.' });
  }

  if (!PRIORIDADES_CHAMADO.includes(prioridade)) {
    return res.status(400).json({ mensagem: 'Prioridade invalida.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [equipamentos] = await connection.execute(
      'SELECT id, status FROM equipamentos WHERE id = ? FOR UPDATE',
      [equipamentoId]
    );

    const equipamento = equipamentos[0];
    if (!equipamento) {
      await connection.rollback();
      return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
    }

    if (equipamento.status !== 'operacional') {
      await connection.rollback();
      return res.status(400).json({
        mensagem: 'Equipamento nao esta operacional para abertura de chamado.',
      });
    }

    const [resultado] = await connection.execute(
      `
        INSERT INTO chamados (
          titulo,
          descricao,
          cliente_id,
          equipamento_id,
          tecnico_id,
          prioridade,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [titulo, descricao, clienteId, equipamentoId, null, prioridade, 'aberto']
    );

    await connection.execute(
      "UPDATE equipamentos SET status = 'em_manutencao' WHERE id = ?",
      [equipamentoId]
    );

    await connection.commit();

    const chamado = await ChamadosModel.buscarDetalhadoPorId(resultado.insertId);
    return res.status(201).json({
      mensagem: 'Chamado criado com sucesso.',
      chamado,
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    connection.release();
  }
};

const atualizarStatus = async (req, res) => {
  const chamadoId = paraIdInteiro(req.params.id);
  const novoStatus = req.body.status;
  const tecnicoIdInformado =
    req.body.tecnico_id === undefined ? undefined : paraIdInteiro(req.body.tecnico_id);

  if (!chamadoId) {
    return res.status(400).json({ mensagem: 'ID de chamado invalido.' });
  }

  if (!novoStatus) {
    return res.status(400).json({ mensagem: 'Campo status e obrigatorio.' });
  }

  if (novoStatus === 'resolvido') {
    return res.status(400).json({
      mensagem:
        'Para resolver um chamado, registre a manutencao em /api/manutencao para salvar o historico tecnico.',
    });
  }

  if (req.usuario.nivel_acesso !== 'admin' && req.body.tecnico_id !== undefined) {
    return res.status(403).json({
      mensagem: 'Somente administradores podem definir tecnico_id manualmente.',
    });
  }

  if (req.body.tecnico_id !== undefined && !tecnicoIdInformado) {
    return res.status(400).json({ mensagem: 'tecnico_id invalido.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [chamados] = await connection.execute(
      'SELECT * FROM chamados WHERE id = ? FOR UPDATE',
      [chamadoId]
    );

    const chamadoAtual = chamados[0];
    if (!chamadoAtual) {
      await connection.rollback();
      return res.status(404).json({ mensagem: 'Chamado nao encontrado.' });
    }

    const proximosStatusPermitidos =
      TRANSICOES_STATUS_CHAMADO[chamadoAtual.status] || [];

    if (!proximosStatusPermitidos.includes(novoStatus)) {
      await connection.rollback();
      return res.status(400).json({
        mensagem: `Transicao invalida: ${chamadoAtual.status} -> ${novoStatus}.`,
      });
    }

    if (
      req.usuario.nivel_acesso === 'tecnico' &&
      chamadoAtual.tecnico_id &&
      chamadoAtual.tecnico_id !== req.usuario.id
    ) {
      await connection.rollback();
      return res.status(403).json({
        mensagem: 'Este chamado ja esta atribuido a outro tecnico.',
      });
    }

    let tecnicoId = chamadoAtual.tecnico_id;

    if (req.usuario.nivel_acesso === 'tecnico') {
      tecnicoId = req.usuario.id;
    }

    if (tecnicoIdInformado !== undefined) {
      const tecnico = await buscarTecnicoValido(tecnicoIdInformado, connection);
      if (!tecnico) {
        await connection.rollback();
        return res.status(400).json({ mensagem: 'tecnico_id nao pertence a um tecnico valido.' });
      }

      tecnicoId = tecnico.id;
    }

    await connection.execute(
      `
        UPDATE chamados
        SET status = ?, tecnico_id = ?
        WHERE id = ?
      `,
      [novoStatus, tecnicoId, chamadoId]
    );

    if (novoStatus === 'cancelado') {
      await connection.execute(
        "UPDATE equipamentos SET status = 'operacional' WHERE id = ?",
        [chamadoAtual.equipamento_id]
      );
    }

    await connection.commit();

    const chamadoAtualizado = await ChamadosModel.buscarDetalhadoPorId(chamadoId);
    return res.status(200).json({
      mensagem: 'Status do chamado atualizado com sucesso.',
      chamado: chamadoAtualizado,
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    connection.release();
  }
};

module.exports = { listar, buscarPorId, criar, atualizarStatus };
