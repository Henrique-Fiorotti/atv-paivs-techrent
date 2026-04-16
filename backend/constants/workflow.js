const NIVEIS_ACESSO = ['cliente', 'admin', 'tecnico'];
const PRIORIDADES_CHAMADO = ['baixa', 'media', 'alta'];
const STATUS_CHAMADO = ['aberto', 'em_atendimento', 'resolvido', 'cancelado'];
const STATUS_EQUIPAMENTO = ['operacional', 'em_manutencao', 'desativado'];

// A resolucao de um chamado deve acontecer via registro de manutencao,
// para que o historico tecnico seja sempre persistido.
const TRANSICOES_STATUS_CHAMADO = {
  aberto: ['em_atendimento', 'cancelado'],
  em_atendimento: ['cancelado'],
  resolvido: [],
  cancelado: [],
};

function normalizarTexto(valor) {
  if (typeof valor !== 'string') {
    return valor;
  }

  const texto = valor.trim();
  return texto.length > 0 ? texto : '';
}

function normalizarTextoOpcional(valor) {
  const texto = normalizarTexto(valor);
  return texto ? texto : null;
}

function paraIdInteiro(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

module.exports = {
  NIVEIS_ACESSO,
  PRIORIDADES_CHAMADO,
  STATUS_CHAMADO,
  STATUS_EQUIPAMENTO,
  TRANSICOES_STATUS_CHAMADO,
  normalizarTexto,
  normalizarTextoOpcional,
  paraIdInteiro,
};
