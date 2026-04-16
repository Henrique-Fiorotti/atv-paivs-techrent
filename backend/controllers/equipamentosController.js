const db = require('../config/database');
const {
  STATUS_EQUIPAMENTO,
  normalizarTexto,
  normalizarTextoOpcional,
  paraIdInteiro,
} = require('../constants/workflow');

function tratarErroPersistencia(error, res) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensagem: 'Ja existe um equipamento com este patrimonio.' });
  }

  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
}

const listar = async (req, res) => {
  try {
    const equipamentos = await db.query(`
      SELECT *
      FROM equipamentos
      ORDER BY
        CASE status
          WHEN 'em_manutencao' THEN 1
          WHEN 'operacional' THEN 2
          ELSE 3
        END,
        nome ASC,
        id ASC
    `);

    return res.status(200).json(equipamentos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const id = paraIdInteiro(req.params.id);
    if (!id) {
      return res.status(400).json({ mensagem: 'ID de equipamento invalido.' });
    }

    const equipamento = await db.query('SELECT * FROM equipamentos WHERE id = ?', [id]);
    if (equipamento.length === 0) {
      return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
    }

    return res.status(200).json(equipamento[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const criar = async (req, res) => {
  try {
    const nome = normalizarTexto(req.body.nome);
    const categoria = normalizarTextoOpcional(req.body.categoria);
    const patrimonio = normalizarTextoOpcional(req.body.patrimonio);
    const status = req.body.status || 'operacional';
    const descricao = normalizarTextoOpcional(req.body.descricao);

    if (!nome) {
      return res.status(400).json({ mensagem: 'Campo nome e obrigatorio.' });
    }

    if (!STATUS_EQUIPAMENTO.includes(status)) {
      return res.status(400).json({ mensagem: 'Status de equipamento invalido.' });
    }

    const result = await db.query(
      'INSERT INTO equipamentos (nome, categoria, patrimonio, status, descricao) VALUES (?, ?, ?, ?, ?)',
      [nome, categoria, patrimonio, status, descricao]
    );

    const criado = await db.query('SELECT * FROM equipamentos WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      mensagem: 'Equipamento criado com sucesso.',
      equipamento: criado[0],
    });
  } catch (error) {
    return tratarErroPersistencia(error, res);
  }
};

const atualizar = async (req, res) => {
  try {
    const id = paraIdInteiro(req.params.id);
    if (!id) {
      return res.status(400).json({ mensagem: 'ID de equipamento invalido.' });
    }

    const atual = await db.query('SELECT * FROM equipamentos WHERE id = ?', [id]);
    if (atual.length === 0) {
      return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
    }

    const nomeInformado = req.body.nome;
    const nomeNormalizado =
      nomeInformado === undefined ? atual[0].nome : normalizarTexto(nomeInformado);

    if (!nomeNormalizado) {
      return res.status(400).json({ mensagem: 'Campo nome nao pode ficar vazio.' });
    }

    const status = req.body.status ?? atual[0].status;
    if (!STATUS_EQUIPAMENTO.includes(status)) {
      return res.status(400).json({ mensagem: 'Status de equipamento invalido.' });
    }

    const chamadosAtivos = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM chamados
        WHERE equipamento_id = ?
          AND status IN ('aberto', 'em_atendimento')
      `,
      [id]
    );

    if (chamadosAtivos[0].total > 0 && status !== 'em_manutencao') {
      return res.status(409).json({
        mensagem:
          'Este equipamento possui chamado ativo e deve permanecer em manutencao ate o encerramento.',
      });
    }

    await db.query(
      `
        UPDATE equipamentos
        SET nome = ?, categoria = ?, patrimonio = ?, status = ?, descricao = ?
        WHERE id = ?
      `,
      [
        nomeNormalizado,
        req.body.categoria === undefined
          ? atual[0].categoria
          : normalizarTextoOpcional(req.body.categoria),
        req.body.patrimonio === undefined
          ? atual[0].patrimonio
          : normalizarTextoOpcional(req.body.patrimonio),
        status,
        req.body.descricao === undefined
          ? atual[0].descricao
          : normalizarTextoOpcional(req.body.descricao),
        id,
      ]
    );

    const atualizado = await db.query('SELECT * FROM equipamentos WHERE id = ?', [id]);
    return res.status(200).json({
      mensagem: 'Equipamento atualizado com sucesso.',
      equipamento: atualizado[0],
    });
  } catch (error) {
    return tratarErroPersistencia(error, res);
  }
};

const remover = async (req, res) => {
  try {
    const id = paraIdInteiro(req.params.id);
    if (!id) {
      return res.status(400).json({ mensagem: 'ID de equipamento invalido.' });
    }

    const relacionamentos = await db.query(
      `
        SELECT
          (SELECT COUNT(*) FROM chamados WHERE equipamento_id = ?) AS total_chamados,
          (SELECT COUNT(*) FROM historico_manutencao WHERE equipamento_id = ?) AS total_manutencoes
      `,
      [id, id]
    );

    if (
      relacionamentos[0].total_chamados > 0 ||
      relacionamentos[0].total_manutencoes > 0
    ) {
      return res.status(409).json({
        mensagem:
          'Nao e permitido remover equipamentos com chamados ou historico de manutencao vinculados.',
      });
    }

    const result = await db.query('DELETE FROM equipamentos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Equipamento removido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
