"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardAdmin from "./admin/page";
import DashboardTecnico from "./painel-tecnico/page";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.nivel_acesso === "admin") {
    return <DashboardAdmin />;
  }

  if (user.nivel_acesso === "tecnico") {
    return <DashboardTecnico />;
  }

  return null;
}
