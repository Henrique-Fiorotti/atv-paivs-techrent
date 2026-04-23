const { query } = require('../config/database');
const EquipamentoModel = require('../models/equipamentosModel');

const STATUS_EQUIPAMENTO = ['operacional', 'em_manutencao', 'desativado'];

class EquipamentoController {
  static async list(req, res) {
    try {
      const equipamentos =
        req.usuario.nivel_acesso === 'admin'
          ? await EquipamentoModel.findAll()
          : await EquipamentoModel.listFunctional();

      return res.status(200).json(equipamentos);
    } catch (error) {
      console.error('Erro ao listar equipamentos:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async findById(req, res) {
    try {
      const equipamento = await EquipamentoModel.findById(req.params.id);

      if (!equipamento) {
        return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
      }

      return res.status(200).json(equipamento);
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async create(req, res) {
    try {
      const { nome, categoria, patrimonio, status, descricao } = req.body;

      if (!nome || !categoria || !patrimonio) {
        return res.status(400).json({
          mensagem: 'Nome, categoria e patrimonio sao obrigatorios.',
        });
      }

      if (status && !STATUS_EQUIPAMENTO.includes(status)) {
        return res.status(400).json({ mensagem: 'Status de equipamento invalido.' });
      }

      const patrimonioExistente = await EquipamentoModel.findByPatrimonio(patrimonio.trim());
      if (patrimonioExistente) {
        return res.status(409).json({ mensagem: 'Ja existe um equipamento com este patrimonio.' });
      }

      const equipamentoId = await EquipamentoModel.create({
        nome: nome.trim(),
        categoria: categoria.trim(),
        patrimonio: patrimonio.trim(),
        status: status || 'operacional',
        descricao: descricao?.trim() || '',
      });

      const equipamento = await EquipamentoModel.findById(equipamentoId);

      return res.status(201).json({
        mensagem: 'Equipamento criado com sucesso.',
        equipamento,
      });
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async update(req, res) {
    try {
      const atual = await EquipamentoModel.findById(req.params.id);

      if (!atual) {
        return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
      }

      const status = req.body.status ?? atual.status;
      if (!STATUS_EQUIPAMENTO.includes(status)) {
        return res.status(400).json({ mensagem: 'Status de equipamento invalido.' });
      }

      const patrimonio = req.body.patrimonio?.trim() ?? atual.patrimonio;
      if (patrimonio && patrimonio !== atual.patrimonio) {
        const patrimonioExistente = await EquipamentoModel.findByPatrimonio(patrimonio);
        if (patrimonioExistente) {
          return res.status(409).json({ mensagem: 'Ja existe um equipamento com este patrimonio.' });
        }
      }

      const chamadosAtivos = await query(
        `
          SELECT COUNT(*) AS total
          FROM chamados
          WHERE equipamento_id = ?
            AND status IN ('aberto', 'em_atendimento')
        `,
        [req.params.id]
      );

      if (chamadosAtivos[0].total > 0 && status !== 'em_manutencao') {
        return res.status(409).json({
          mensagem: 'Equipamentos com chamado ativo devem permanecer em manutencao.',
        });
      }

      await EquipamentoModel.update(req.params.id, {
        nome: req.body.nome?.trim() || atual.nome,
        categoria: req.body.categoria?.trim() || atual.categoria,
        patrimonio,
        status,
        descricao:
          req.body.descricao === undefined ? atual.descricao : req.body.descricao?.trim() || '',
      });

      const equipamento = await EquipamentoModel.findById(req.params.id);

      return res.status(200).json({
        mensagem: 'Equipamento atualizado com sucesso.',
        equipamento,
      });
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status || !STATUS_EQUIPAMENTO.includes(status)) {
        return res.status(400).json({ mensagem: 'Status de equipamento invalido.' });
      }

      const equipamento = await EquipamentoModel.findById(req.params.id);
      if (!equipamento) {
        return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
      }

      await EquipamentoModel.updateStatus({ id: req.params.id, status });

      return res.status(200).json({
        mensagem: `Status do equipamento atualizado para '${status}'.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do equipamento:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async delete(req, res) {
    try {
      const relacionamentos = await query(
        `
          SELECT
            (SELECT COUNT(*) FROM chamados WHERE equipamento_id = ?) AS total_chamados,
            (SELECT COUNT(*) FROM historico_manutencao WHERE equipamento_id = ?) AS total_manutencoes
        `,
        [req.params.id, req.params.id]
      );

      if (
        relacionamentos[0].total_chamados > 0 ||
        relacionamentos[0].total_manutencoes > 0
      ) {
        return res.status(409).json({
          mensagem:
            'Nao e permitido deletar este equipamento porque ele possui chamados ou manutencoes vinculados.',
        });
      }

      const deletado = await EquipamentoModel.deleteById(req.params.id);

      if (!deletado) {
        return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
      }

      return res.status(200).json({ mensagem: 'Equipamento deletado com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar equipamento:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }
}

module.exports = EquipamentoController;
