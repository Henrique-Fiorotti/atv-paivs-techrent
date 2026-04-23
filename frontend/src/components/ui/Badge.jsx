export function Badge({ children, status, variant = "default", className = "" }) {
  const statusColors = {
    pendente: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    ativo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    aberto: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    em_atendimento: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    em_atendimento_text: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    resolvido: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    finalizado: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    cancelado: "bg-red-500/20 text-red-300 border-red-500/30",
    operacional: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    em_manutencao: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    manutencao: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    desativado: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    alta: "bg-red-500/20 text-red-300 border-red-500/30",
    media: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    baixa: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  const variantColors = {
    default: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    error: "bg-red-500/20 text-red-300 border-red-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    info: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  };

  const colors = status ? statusColors[status] || statusColors.ativo : variantColors[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur transition-all ${colors} ${className}`}
    >
      {children}
    </span>
  );
}
