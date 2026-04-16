const { pool } = require('../config/database');
const { paraIdInteiro, normalizarTexto } = require('../constants/workflow');

const listar = async (req, res) => {
  try {
    const [registros] = await pool.query(`
      SELECT
        hm.*,
        c.titulo AS chamado_titulo,
        c.status AS chamado_status,
        e.nome AS equipamento_nome,
        e.patrimonio AS equipamento_patrimonio,
        u.nome AS tecnico_nome
      FROM historico_manutencao hm
      JOIN chamados c ON hm.chamado_id = c.id
      JOIN equipamentos e ON hm.equipamento_id = e.id
      JOIN usuarios u ON hm.tecnico_id = u.id
      ORDER BY hm.registrado_em DESC, hm.id DESC
    `);

    return res.status(200).json(registros);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const registrar = async (req, res) => {
  const chamadoId = paraIdInteiro(req.body.chamado_id);
  const equipamentoId = paraIdInteiro(req.body.equipamento_id);
  const descricao = normalizarTexto(req.body.descricao);
  const tecnicoId = req.usuario.id;

  if (!chamadoId || !equipamentoId || !descricao) {
    return res.status(400).json({
      mensagem: 'Campos chamado_id, equipamento_id e descricao sao obrigatorios.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [chamados] = await connection.execute(
      'SELECT * FROM chamados WHERE id = ? FOR UPDATE',
      [chamadoId]
    );

    const chamado = chamados[0];
    if (!chamado) {
      await connection.rollback();
      return res.status(404).json({ mensagem: 'Chamado nao encontrado.' });
    }

    if (chamado.equipamento_id !== equipamentoId) {
      await connection.rollback();
      return res.status(400).json({
        mensagem: 'O equipamento informado nao corresponde ao equipamento do chamado.',
      });
    }

    if (['resolvido', 'cancelado'].includes(chamado.status)) {
      await connection.rollback();
      return res.status(400).json({
        mensagem: 'Este chamado ja foi encerrado e nao pode receber novo registro de manutencao.',
      });
    }

    if (chamado.tecnico_id && chamado.tecnico_id !== tecnicoId) {
      await connection.rollback();
      return res.status(403).json({
        mensagem: 'Este chamado ja esta atribuido a outro tecnico.',
      });
    }

    await connection.execute(
      `
        INSERT INTO historico_manutencao (chamado_id, equipamento_id, tecnico_id, descricao)
        VALUES (?, ?, ?, ?)
      `,
      [chamadoId, equipamentoId, tecnicoId, descricao]
    );

    await connection.execute(
      `
        UPDATE chamados
        SET status = 'resolvido', tecnico_id = ?
        WHERE id = ?
      `,
      [tecnicoId, chamadoId]
    );

    await connection.execute(
      "UPDATE equipamentos SET status = 'operacional' WHERE id = ?",
      [equipamentoId]
    );

    await connection.commit();

    return res.status(201).json({
      mensagem: 'Manutencao registrada com sucesso e chamado resolvido.',
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  } finally {
    connection.release();
  }
};

module.exports = { listar, registrar };
