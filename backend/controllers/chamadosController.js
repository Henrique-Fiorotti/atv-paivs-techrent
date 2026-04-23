const { withTransaction } = require('../config/database');
const ChamadaModel = require('../models/chamadosModel');
const EquipamentoModel = require('../models/equipamentosModel');

const PRIORIDADES = ['baixa', 'media', 'alta'];
const STATUS = ['aberto', 'em_atendimento', 'resolvido', 'cancelado'];

class ChamadaController {
  static async list(req, res) {
    try {
      const chamados = await ChamadaModel.findByAccessLevel({
        id: req.usuario.id,
        cliente: req.usuario.nivel_acesso === 'cliente',
      });

      return res.status(200).json(chamados);
    } catch (error) {
      console.error('Erro ao listar chamados:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async findById(req, res) {
    try {
      const chamado = await ChamadaModel.findById(req.params.id);

      if (!chamado) {
        return res.status(404).json({ mensagem: 'Chamado nao encontrado.' });
      }

      if (req.usuario.nivel_acesso === 'cliente' && chamado.cliente_id !== req.usuario.id) {
        return res.status(403).json({ mensagem: 'Acesso negado para este chamado.' });
      }

      return res.status(200).json(chamado);
    } catch (error) {
      console.error('Erro ao buscar chamado:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async create(req, res) {
    try {
      const { titulo, descricao, equipamento_id, prioridade } = req.body;

      if (!titulo || !descricao || !equipamento_id) {
        return res.status(400).json({
          mensagem: 'Titulo, descricao e equipamento_id sao obrigatorios.',
        });
      }

      if (prioridade && !PRIORIDADES.includes(prioridade)) {
        return res.status(400).json({ mensagem: 'Prioridade invalida.' });
      }

      const equipamento = await EquipamentoModel.findById(equipamento_id);
      if (!equipamento) {
        return res.status(404).json({ mensagem: 'Equipamento nao encontrado.' });
      }

      if (equipamento.status !== 'operacional') {
        return res.status(409).json({
          mensagem: 'Apenas equipamentos operacionais podem receber novos chamados.',
        });
      }

      const chamadoId = await withTransaction(async (connection) => {
        const novoChamadoId = await ChamadaModel.create(
          {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            cliente_id: req.usuario.id,
            equipamento_id: Number(equipamento_id),
            tecnico_id: null,
            prioridade: prioridade || 'media',
            status: 'aberto',
          },
          connection
        );

        await EquipamentoModel.updateStatus(
          { id: Number(equipamento_id), status: 'em_manutencao' },
          connection
        );

        return novoChamadoId;
      });

      const chamado = await ChamadaModel.findById(chamadoId);

      return res.status(201).json({
        mensagem: 'Chamado criado com sucesso.',
        chamado,
      });
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status, tecnico_id } = req.body;
      const chamado = await ChamadaModel.findById(req.params.id);

      if (!status) {
        return res.status(400).json({ mensagem: 'O novo status e obrigatorio.' });
      }

      if (!STATUS.includes(status)) {
        return res.status(400).json({ mensagem: 'Status invalido.' });
      }

      if (!chamado) {
        return res.status(404).json({ mensagem: 'Chamado nao encontrado.' });
      }

      if (
        req.usuario.nivel_acesso === 'tecnico' &&
        tecnico_id &&
        Number(tecnico_id) !== req.usuario.id
      ) {
        return res.status(403).json({
          mensagem: 'Voce so pode assumir ou atualizar chamados em seu proprio nome.',
        });
      }

      const tecnicoResponsavel =
        tecnico_id ||
        (status === 'em_atendimento' &&
        ['admin', 'tecnico'].includes(req.usuario.nivel_acesso)
          ? req.usuario.id
          : null);

      if (
        tecnicoResponsavel &&
        chamado.tecnico_id &&
        chamado.tecnico_id !== Number(tecnicoResponsavel) &&
        req.usuario.nivel_acesso !== 'admin'
      ) {
        return res.status(409).json({ mensagem: 'Este chamado ja esta atribuido a outro tecnico.' });
      }

      await withTransaction(async (connection) => {
        if (tecnicoResponsavel) {
          await ChamadaModel.setTecnico(
            { id: req.params.id, tecnico_id: Number(tecnicoResponsavel) },
            connection
          );
        }

        if (status !== 'em_atendimento') {
          await ChamadaModel.updateStatus({ id: req.params.id, status }, connection);
        }

        if (status === 'resolvido' || status === 'cancelado') {
          await EquipamentoModel.updateStatus(
            { id: chamado.equipamento_id, status: 'operacional' },
            connection
          );
        }
      });

      const chamadoAtualizado = await ChamadaModel.findById(req.params.id);

      return res.status(200).json({
        mensagem: 'Status atualizado com sucesso.',
        chamado: chamadoAtualizado,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do chamado:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }
}

module.exports = ChamadaController;
