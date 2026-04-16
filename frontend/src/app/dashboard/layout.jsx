"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";

const DEFAULT_ROUTE_BY_ROLE = {
  cliente: "/dashboard/chamados",
  admin: "/dashboard",
  tecnico: "/dashboard",
};

function getAllowedRoles(pathname) {
  if (pathname === "/dashboard") {
    return ["admin", "tecnico"];
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return ["admin"];
  }

  if (pathname.startsWith("/dashboard/equipamentos")) {
    return ["admin"];
  }

  if (pathname.startsWith("/dashboard/usuarios")) {
    return ["admin"];
  }

  if (pathname.startsWith("/dashboard/painel-tecnico")) {
    return ["admin", "tecnico"];
  }

  if (pathname.startsWith("/dashboard/historico")) {
    return ["admin", "tecnico"];
  }

  if (pathname.startsWith("/dashboard/chamados")) {
    return ["cliente", "admin"];
  }

  return ["admin", "tecnico"];
}

function getRedirectPath(user, pathname) {
  if (!user) {
    return "/";
  }

  const allowedRoles = getAllowedRoles(pathname);
  if (allowedRoles.includes(user.nivel_acesso)) {
    return null;
  }

  return DEFAULT_ROUTE_BY_ROLE[user.nivel_acesso] || "/";
}

function LoadingScreen({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">{message}</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const redirectPath = useMemo(() => {
    if (loading) {
      return null;
    }

    return getRedirectPath(user, pathname);
  }, [loading, pathname, user]);

  useEffect(() => {
    if (!loading && redirectPath && redirectPath !== pathname) {
      router.replace(redirectPath);
    }
  }, [loading, pathname, redirectPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoadingScreen message="Redirecionando para login..." />;
  }

  if (redirectPath && redirectPath !== pathname) {
    return <LoadingScreen message="Redirecionando..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
