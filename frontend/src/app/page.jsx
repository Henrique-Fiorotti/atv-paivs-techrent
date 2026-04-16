"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { authAPI } from "@/lib/api";
import { Input, Button, Select } from "@/components/ui/Form";
import { Card } from "@/components/ui/Card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Carregando...</p>
        </div>
      </main>
    );
  }

  // Se já está autenticado, não mostrar login
  if (user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Redirecionando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Header */}
        <header className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TechRent</h1>
            <p className="text-sm text-zinc-600">Plataforma de chamados, manutenção e gestão de ativos</p>
          </div>
          <div className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-medium text-white">
            API: {API_URL}
          </div>
        </header>

        {/* Auth Card */}
        <Card className="mx-auto w-full max-w-lg">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                authModo === "login"
                  ? "bg-white shadow text-zinc-900"
                  : "text-zinc-600"
              }`}
              onClick={() => setAuthModo("login")}
              disabled={isSubmitting}
            >
              Login
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                authModo === "registro"
                  ? "bg-white shadow text-zinc-900"
                  : "text-zinc-600"
              }`}
              onClick={() => setAuthModo("registro")}
              disabled={isSubmitting}
            >
              Registro
            </button>
          </div>

          {authModo === "login" ? (
            <form className="grid gap-3" onSubmit={handleLogin}>
              <Input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={loginForm.senha}
                onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form className="grid gap-3" onSubmit={handleRegistro}>
              <Input
                placeholder="Nome"
                value={registroForm.nome}
                onChange={(e) => setRegistroForm({ ...registroForm, nome: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <Input
                type="email"
                placeholder="Email"
                value={registroForm.email}
                onChange={(e) => setRegistroForm({ ...registroForm, email: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={registroForm.senha}
                onChange={(e) => setRegistroForm({ ...registroForm, senha: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <Select
                value={registroForm.nivel_acesso}
                onChange={(e) => setRegistroForm({ ...registroForm, nivel_acesso: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
                <option value="tecnico">Técnico</option>
              </Select>
              <Button 
                type="submit" 
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
            </form>
          )}
        </Card>

        {/* Info */}
        <div className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold mb-3">Credenciais de Teste</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-zinc-900">Admin</p>
              <p className="text-zinc-600">admin@example.com</p>
              <p className="text-zinc-600">senha123</p>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Técnico</p>
              <p className="text-zinc-600">tecnico@example.com</p>
              <p className="text-zinc-600">senha123</p>
            </div>
            <div>
              <p className="font-medium text-zinc-900">Cliente</p>
              <p className="text-zinc-600">cliente@example.com</p>
              <p className="text-zinc-600">senha123</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
