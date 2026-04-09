// =============================================
// CONTROLLER DE DASHBOARD
// =============================================
// Usa as VIEWS do banco para retornar dados agregados.
// TODO (alunos): implementar cada função abaixo.

const db = require('../config/database');

// GET /dashboard/admin - resumo geral de chamados e equipamentos (apenas admin)
// Usa as views: view_resumo_chamados e view_resumo_equipamentos
const resumoAdmin = async (req, res) => {
  try {
    const resumoChamados = await db.query('SELECT * FROM view_resumo_chamados');
    const resumoEquipamentos = await db.query('SELECT * FROM view_resumo_equipamentos');

    return res.status(200).json({
      chamados: resumoChamados,
      equipamentos: resumoEquipamentos
    });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

// GET /dashboard/tecnico - chamados abertos/em andamento (técnico/admin)
// Usa a view: view_painel_tecnico
const painelTecnico = async (req, res) => {
  try {
    const painel = await db.query('SELECT * FROM view_painel_tecnico');
    return res.status(200).json(painel);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

module.exports = { resumoAdmin, painelTecnico };
