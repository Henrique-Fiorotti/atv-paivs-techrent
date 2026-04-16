"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardAdmin from "./admin/page";
import DashboardTecnico from "./painel-tecnico/page";
import DashboardCliente from "./chamados/page";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Renderizar dashboard específico por role
  if (user.nivel_acesso === "admin") {
    return <DashboardAdmin />;
  }

  if (user.nivel_acesso === "tecnico") {
    return <DashboardTecnico />;
  }

  // Cliente vê seus chamados
  return <DashboardCliente />;
}
