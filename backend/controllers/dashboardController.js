const ChamadaModel = require('../models/chamadosModel');
const EquipamentoModel = require('../models/equipamentosModel');

function mapearTotaisPorStatus(registros) {
  return registros.reduce((acc, item) => {
    acc[item.status] = item.total;
    return acc;
  }, {});
}

class DashboardController {
  static async viewAdmin(req, res) {
    try {
      const [chamados, equipamentos] = await Promise.all([
        ChamadaModel.countByStatus(),
        EquipamentoModel.countByStatus(),
      ]);

      return res.status(200).json({
        chamados_por_status: mapearTotaisPorStatus(chamados),
        equipamentos_por_status: mapearTotaisPorStatus(equipamentos),
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard admin:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async viewTecnico(req, res) {
    try {
      const painel = await ChamadaModel.viewTecnico();
      return res.status(200).json(painel);
    } catch (error) {
      console.error('Erro ao carregar painel tecnico:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }

  static async viewCliente(req, res) {
    try {
      const chamados = await ChamadaModel.findByAccessLevel({
        id: req.usuario.id,
        cliente: true,
      });

      return res.status(200).json(chamados);
    } catch (error) {
      console.error('Erro ao carregar painel cliente:', error);
      return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
  }
}

module.exports = DashboardController;
