const db = require('../config/database');

function tratarErroDashboard(error, res) {
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({
      mensagem:
        'As views do dashboard nao foram encontradas. Execute bd/views.sql antes de usar esta rota.',
    });
  }

  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
}

const resumoAdmin = async (req, res) => {
  try {
    const resumoChamados = await db.query('SELECT * FROM view_resumo_chamados');
    const resumoEquipamentos = await db.query('SELECT * FROM view_resumo_equipamentos');

    return res.status(200).json({
      chamados: resumoChamados,
      equipamentos: resumoEquipamentos,
    });
  } catch (error) {
    return tratarErroDashboard(error, res);
  }
};

const painelTecnico = async (req, res) => {
  try {
    const painel = await db.query('SELECT * FROM view_painel_tecnico');
    return res.status(200).json(painel);
  } catch (error) {
    return tratarErroDashboard(error, res);
  }
};

module.exports = { resumoAdmin, painelTecnico };
