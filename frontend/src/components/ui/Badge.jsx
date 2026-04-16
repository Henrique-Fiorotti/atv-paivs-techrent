export function Badge({ children, status, variant = "default", className = "" }) {
  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ativo: "bg-blue-100 text-blue-800 border-blue-300",
    finalizado: "bg-green-100 text-green-800 border-green-300",
    cancelado: "bg-red-100 text-red-800 border-red-300",
    operacional: "bg-green-100 text-green-800 border-green-300",
    manutencao: "bg-orange-100 text-orange-800 border-orange-300",
  };

  const variantColors = {
    default: "bg-blue-100 text-blue-800 border-blue-300",
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  const colors = status ? statusColors[status] : variantColors[variant];

  return (
    <span
      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium border ${colors} ${className}`}
    >
      {children}
    </span>
  );
}
