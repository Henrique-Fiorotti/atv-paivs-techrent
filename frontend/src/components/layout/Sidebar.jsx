"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Ticket,
  Cpu,
  Users,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  ShieldCheck,
} from "lucide-react";

const menuItems = {
  cliente: [
    { label: "Meus Chamados", href: "/dashboard/chamados", icon: Ticket },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Chamados", href: "/dashboard/chamados", icon: Ticket },
    { label: "Equipamentos", href: "/dashboard/equipamentos", icon: Cpu },
    { label: "Usuarios", href: "/dashboard/usuarios", icon: Users },
  ],
  tecnico: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Painel de Chamados", href: "/dashboard/painel-tecnico", icon: Zap },
    { label: "Historico", href: "/dashboard/historico", icon: Clock },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const items = menuItems[user.nivel_acesso] || menuItems.cliente;

  const getRoleIcon = () => {
    switch (user.nivel_acesso) {
      case "admin":
        return <ShieldCheck size={20} />;
      case "tecnico":
        return <Zap size={20} />;
      default:
        return <Ticket size={20} />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-linear-to-r from-blue-600 to-purple-600 text-white p-2.5 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl transform transition-transform duration-300 z-40 border-r border-slate-700/50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TechRent
              </h1>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-slate-100">{user.nome}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {getRoleIcon()}
              <span className="capitalize">{user.nivel_acesso}</span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all group"
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className="text-blue-400 group-hover:text-purple-400 transition-colors" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-linear-to-r from-slate-900 to-slate-800">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all font-semibold shadow-lg"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="hidden lg:block w-64" />
    </>
  );
}
