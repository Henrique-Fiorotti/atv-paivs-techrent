"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { API_BASE_URL, authAPI } from "@/lib/api";
import { Input, Button, Select } from "@/components/ui/Form";
import { Card } from "@/components/ui/Card";
import { Lock, Mail, User, Zap, ArrowRight, Shield } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const { login } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [authModo, setAuthModo] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registroForm, setRegistroForm] = useState({
    nome: "",
    email: "",
    senha: "",
    nivel_acesso: "cliente",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar para dashboard se já autenticado
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

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = await authAPI.login(loginForm.email, loginForm.senha);
      
      // Extrair dados do usuário do token JWT
      const payload = data.usuario || JSON.parse(atob(data.token.split(".")[1]));
      
      // Fazer login e atualizar contexto
      login(payload, data.token);
      
      showSuccess("Login realizado com sucesso!");
      setLoginForm({ email: "", senha: "" });
      
      // Redirecionar imediatamente baseado no role
      setTimeout(() => {
        if (payload.nivel_acesso === "admin") {
          router.push("/dashboard/admin");
        } else if (payload.nivel_acesso === "tecnico") {
          router.push("/dashboard/painel-tecnico");
        } else {
          router.push("/dashboard/chamados");
        }
      }, 500); // Pequeno delay para garantir que o contexto foi atualizado
    } catch (error) {
      showError(error.message);
      setIsSubmitting(false);
    }
  }

  async function handleRegistro(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await authAPI.registro(
        registroForm.nome,
        registroForm.email,
        registroForm.senha,
        registroForm.nivel_acesso
      );
      showSuccess("Usuário registrado com sucesso! Faça login para continuar.");
      setRegistroForm({ nome: "", email: "", senha: "", nivel_acesso: "cliente" });
      setAuthModo("login");
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Carregando...</p>
        </div>
      </main>
    );
  }

  // Se já está autenticado, não mostrar login
  if (user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Redirecionando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-linear-to-br lg:from-slate-900 lg:to-blue-900 lg:p-12 lg:relative lg:overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-4 bg-linear-to-b rounded-2xl">
              <img src="/techrent_logo.svg" alt="" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 text-center">TechRent</h1>
          <p className="text-xl text-blue-200 text-center mb-8 max-w-md">
            Plataforma moderna de gestão de chamados e manutenção de TI
          </p>
          
          <div className="space-y-4 mt-12 text-center flex flex-col items-center">
            <div className="flex items-center gap-3 text-slate-300">
              <Zap size={20} className="text-blue-400" />
              <span>Chamados rápidos e eficientes</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Shield size={20} className="text-purple-400" />
              <span>Rastreamento completo de ativos</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <User size={20} className="text-cyan-400" />
              <span>Gestão de técnicos e equipes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
                <Zap size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">TechRent</h1>
            </div>
            <p className="text-slate-400 text-sm">Gestão de chamados e manutenção de TI</p>
          </div>

          {/* Tab Buttons */}
          <div className="mb-8 grid grid-cols-2 gap-2 bg-slate-800/50 rounded-xl p-1.5 border border-slate-700/50">
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authModo === "login"
                  ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setAuthModo("login")}
              disabled={isSubmitting}
            >
              Entrar
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                authModo === "registro"
                  ? "bg-linear-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setAuthModo("registro")}
              disabled={isSubmitting}
            >
              Criar Conta
            </button>
          </div>

          {/* Auth Form */}
          {authModo === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.senha}
                    onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : <>
                  Entrar
                  <ArrowRight size={18} />
                </>}
              </Button>

              <p className="text-center text-sm text-slate-400 mt-4">
                Não tem conta? <span onClick={() => setAuthModo("registro")} className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold">Crie uma agora</span>
              </p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegistro}>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    placeholder="Seu nome completo"
                    value={registroForm.nome}
                    onChange={(e) => setRegistroForm({ ...registroForm, nome: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={registroForm.email}
                    onChange={(e) => setRegistroForm({ ...registroForm, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={registroForm.senha}
                    onChange={(e) => setRegistroForm({ ...registroForm, senha: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Tipo de Conta</label>
                <Select
                  value={registroForm.nivel_acesso}
                  onChange={(e) => setRegistroForm({ ...registroForm, nivel_acesso: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="cliente">Cliente</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Administrador</option>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-linear-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Criando..." : <>
                  Criar Conta
                  <ArrowRight size={18} />
                </>}
              </Button>

              <p className="text-center text-sm text-slate-400 mt-4">
                Já tem conta? <span onClick={() => setAuthModo("login")} className="text-purple-400 hover:text-purple-300 cursor-pointer font-semibold">Faça login aqui</span>
              </p>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}

