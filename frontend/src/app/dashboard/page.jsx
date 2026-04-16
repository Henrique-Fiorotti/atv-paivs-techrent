"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirecionar para dashboard específico por role
      if (user.nivel_acesso === "admin") {
        router.push("/dashboard/admin");
      } else if (user.nivel_acesso === "tecnico") {
        router.push("/dashboard/painel-tecnico");
      } else {
        router.push("/dashboard/chamados");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-zinc-600">Redirecionando...</p>
    </div>
  );
}
