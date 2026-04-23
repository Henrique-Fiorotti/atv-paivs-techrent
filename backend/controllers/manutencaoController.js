const { withTransaction } = require('../config/database');
const ChamadaModel = require('../models/chamadosModel');
const EquipamentoModel = require('../models/equipamentosModel');
const ManutencaoModel = require('../models/manutencaoModel');

class ManutencaoController {
  static async list(req, res) {
    try {
      if (req.query.chamado_id) {
        const historico = await ManutencaoModel.findByChamadoId(req.query.chamado_id);
        return res.status(200).json(historico);
      }

      const manutencoes = await ManutencaoModel.findAll();
      return res.status(200).json(manutencoes);
    } catch (error) {
      console.error('Erro ao listar manutencoes:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async register(req, res) {
    try {
      const { chamado_id, equipamento_id, descricao, status_equipamento } = req.body;

      if (!chamado_id || !equipamento_id || !descricao) {
        return res.status(400).json({
          mensagem: 'Chamado, equipamento e descricao sao obrigatorios.',
        });
      }

      const chamado = await ChamadaModel.findById(chamado_id);
      if (!chamado) {
        return res.status(404).json({ mensagem: 'Chamado nao encontrado.' });
      }

      if (Number(chamado.equipamento_id) !== Number(equipamento_id)) {
        return res.status(409).json({
          mensagem: 'O equipamento informado nao corresponde ao chamado selecionado.',
        });
      }

      if (!['aberto', 'em_atendimento'].includes(chamado.status)) {
        return res.status(400).json({ mensagem: 'Este chamado nao pode receber manutencao.' });
      }

      if (
        req.usuario.nivel_acesso === 'tecnico' &&
        chamado.tecnico_id &&
        chamado.tecnico_id !== req.usuario.id
      ) {
        return res.status(403).json({
          mensagem: 'Voce so pode registrar manutencao para chamados atribuidos a voce.',
        });
      }

      const manutencaoId = await withTransaction(async (connection) => {
        if (!chamado.tecnico_id) {
          await ChamadaModel.setTecnico(
            { id: chamado_id, tecnico_id: req.usuario.id },
            connection
          );
        }

        const novoId = await ManutencaoModel.create(
          {
            chamado_id: Number(chamado_id),
            equipamento_id: Number(equipamento_id),
            tecnico_id: req.usuario.id,
            descricao: descricao.trim(),
          },
          connection
        );

        await ChamadaModel.updateStatus({ id: chamado_id, status: 'resolvido' }, connection);
        await EquipamentoModel.updateStatus(
          { id: Number(equipamento_id), status: status_equipamento || 'operacional' },
          connection
        );

        return novoId;
      });

      return res.status(201).json({
        mensagem: 'Manutencao registrada com sucesso.',
        manutencao_id: manutencaoId,
      });
    } catch (error) {
      console.error('Erro ao registrar manutencao:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async updateDescription(req, res) {
    try {
      const { descricao } = req.body;

      if (!descricao) {
        return res.status(400).json({ mensagem: 'A nova descricao e obrigatoria.' });
      }

      const atualizado = await ManutencaoModel.updateDescription(req.params.id, descricao.trim());
      if (!atualizado) {
        return res.status(404).json({ mensagem: 'Registro de manutencao nao encontrado.' });
      }

      return res.status(200).json({ mensagem: 'Descricao atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar manutencao:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }
}

module.exports = ManutencaoController;
