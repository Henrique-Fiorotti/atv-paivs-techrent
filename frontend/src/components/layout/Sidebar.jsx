"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = {
  cliente: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Meus Chamados", href: "/dashboard/chamados" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Chamados", href: "/dashboard/chamados" },
    { label: "Equipamentos", href: "/dashboard/equipamentos" },
    { label: "Usuários", href: "/dashboard/usuarios" },
  ],
  tecnico: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Painel de Chamados", href: "/dashboard/painel-tecnico" },
    { label: "Histórico", href: "/dashboard/historico" },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  if (!user) return null;

  const items = menuItems[user.nivel_acesso] || menuItems.cliente;

  return (
    <>
      {/* Botão de toggle para mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">TechRent</h1>
          <p className="text-sm text-blue-200 mt-1">{user.nome}</p>
          <p className="text-xs text-blue-300 capitalize">{user.nivel_acesso}</p>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Espaço para o conteúdo (desktop) */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
