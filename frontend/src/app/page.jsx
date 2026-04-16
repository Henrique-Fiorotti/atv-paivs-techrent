"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  authAPI,
  equipamentosAPI,
  chamadosAPI,
  manutencaoAPI,
  dashboardAPI,
} from "@/lib/api";
import { Input, Button, FormGroup, Select, Textarea } from "@/components/ui/Form";
import { Modal, ModalWithFooter } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent, StatsCard, PageHeader, EmptyState } from "@/components/ui/Card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function Home() {
  const { user, token, login, logout, loading } = useAuth();
  const { showSuccess, showError } = useToast();

  // Estados de autenticação
  const [authModo, setAuthModo] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [registroForm, setRegistroForm] = useState({
    nome: "",
    email: "",
    senha: "",
    nivel_acesso: "cliente",
  });

  // Estados de dados
  const [equipamentos, setEquipamentos] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  // Estados de modais
  const [modalEquipamento, setModalEquipamento] = useState(false);
  const [modalChamado, setModalChamado] = useState(false);
  const [modalManutencao, setModalManutencao] = useState(false);

  // Estados de formulários
  const [novoEquipamento, setNovoEquipamento] = useState({
    nome: "",
    categoria: "",
    patrimonio: "",
    status: "operacional",
    descricao: "",
  });

  const [novoChamado, setNovoChamado] = useState({
    titulo: "",
    descricao: "",
    equipamento_id: "",
    prioridade: "media",
  });

  const [novaManutencao, setNovaManutencao] = useState({
    chamado_id: "",
    equipamento_id: "",
    descricao: "",
  });

  // Carregar dados ao autenticar
  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  async function carregarDados() {
    try {
      if (user?.nivel_acesso === "admin") {
        const [equipRes, chamRes, dashRes] = await Promise.all([
          equipamentosAPI.getAll(),
          chamadosAPI.getAll(),
          dashboardAPI.getAdmin(),
        ]);
        setEquipamentos(equipRes);
        setChamados(chamRes);
        setDashboard(dashRes);
      } else if (user?.nivel_acesso === "tecnico") {
        const [chamRes, manRes, dashRes] = await Promise.all([
          chamadosAPI.getAll(),
          manutencaoAPI.getAll(),
          dashboardAPI.getTecnico(),
        ]);
        setChamados(chamRes);
        setManutencoes(manRes);
        setDashboard(dashRes);
      } else {
        const [chamRes] = await Promise.all([chamadosAPI.getAll()]);
        setChamados(chamRes);
      }
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const data = await authAPI.login(loginForm.email, loginForm.senha);
      const payload = data.usuario || JSON.parse(atob(data.token.split(".")[1]));
      login(payload, data.token);
      showSuccess("Login realizado com sucesso!");
      setLoginForm({ email: "", senha: "" });
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleRegistro(e) {
    e.preventDefault();
    try {
      await authAPI.registro(
        registroForm.nome,
        registroForm.email,
        registroForm.senha,
        registroForm.nivel_acesso
      );
      showSuccess("Usuário registrado com sucesso!");
      setRegistroForm({ nome: "", email: "", senha: "", nivel_acesso: "cliente" });
      setAuthModo("login");
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleCriarEquipamento(e) {
    e.preventDefault();
    try {
      await equipamentosAPI.create(novoEquipamento);
      showSuccess("Equipamento criado com sucesso!");
      setNovoEquipamento({ nome: "", categoria: "", patrimonio: "", status: "operacional", descricao: "" });
      setModalEquipamento(false);
      carregarDados();
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleCriarChamado(e) {
    e.preventDefault();
    try {
      await chamadosAPI.create({
        ...novoChamado,
        equipamento_id: Number(novoChamado.equipamento_id),
      });
      showSuccess("Chamado criado com sucesso!");
      setNovoChamado({ titulo: "", descricao: "", equipamento_id: "", prioridade: "media" });
      setModalChamado(false);
      carregarDados();
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleRegistrarManutencao(e) {
    e.preventDefault();
    try {
      await manutencaoAPI.create({
        ...novaManutencao,
        chamado_id: Number(novaManutencao.chamado_id),
        equipamento_id: Number(novaManutencao.equipamento_id),
      });
      showSuccess("Manutenção registrada com sucesso!");
      setNovaManutencao({ chamado_id: "", equipamento_id: "", descricao: "" });
      setModalManutencao(false);
      carregarDados();
    } catch (error) {
      showError(error.message);
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

  // Tela de autenticação
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <header className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">TechRent</h1>
              <p className="text-sm text-zinc-600">Plataforma de chamados, manutenção e gestão de ativos</p>
            </div>
            <div className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-medium text-white">
              API: {API_URL}
            </div>
          </header>

          <Card className="mx-auto w-full max-w-lg">
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
              <button
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  authModo === "login"
                    ? "bg-white shadow text-zinc-900"
                    : "text-zinc-600"
                }`}
                onClick={() => setAuthModo("login")}
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
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={loginForm.senha}
                  onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                  required
                />
                <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500">
                  Entrar
                </Button>
              </form>
            ) : (
              <form className="grid gap-3" onSubmit={handleRegistro}>
                <Input
                  placeholder="Nome"
                  value={registroForm.nome}
                  onChange={(e) => setRegistroForm({ ...registroForm, nome: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={registroForm.email}
                  onChange={(e) => setRegistroForm({ ...registroForm, email: e.target.value })}
                  required
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={registroForm.senha}
                  onChange={(e) => setRegistroForm({ ...registroForm, senha: e.target.value })}
                  required
                />
                <Select
                  value={registroForm.nivel_acesso}
                  onChange={(e) => setRegistroForm({ ...registroForm, nivel_acesso: e.target.value })}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                  <option value="tecnico">Técnico</option>
                </Select>
                <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-500">
                  Registrar
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    );
  }

  // Dashboard autenticado
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Header */}
        <header className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TechRent</h1>
            <p className="text-sm text-zinc-600">
              Bem-vindo, {user?.nome} ({user?.nivel_acesso})
            </p>
          </div>
          <Button onClick={() => logout()} variant="outline">
            Sair
          </Button>
        </header>

        {/* Dashboard Stats */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.total_equipamentos && (
              <StatsCard title="Total de Equipamentos" value={dashboard.total_equipamentos} />
            )}
            {dashboard.equipamentos_disponiveis && (
              <StatsCard title="Disponíveis" value={dashboard.equipamentos_disponiveis} />
            )}
            {dashboard.chamados_abertos && (
              <StatsCard title="Chamados Abertos" value={dashboard.chamados_abertos} />
            )}
            {dashboard.manutencoes_pendentes && (
              <StatsCard title="Manutenções Pendentes" value={dashboard.manutencoes_pendentes} />
            )}
          </div>
        )}

        {/* Equipamentos (Admin) */}
        {user?.nivel_acesso === "admin" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipamentos</CardTitle>
                <Button onClick={() => setModalEquipamento(true)} size="sm">
                  + Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {equipamentos.length === 0 ? (
                <EmptyState
                  title="Nenhum equipamento"
                  description="Comece criando um novo equipamento"
                  action={<Button onClick={() => setModalEquipamento(true)}>Criar Equipamento</Button>}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="text-left px-4 py-3 font-semibold">Nome</th>
                        <th className="text-left px-4 py-3 font-semibold">Categoria</th>
                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipamentos.map((eq) => (
                        <tr key={eq.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                          <td className="px-4 py-3">{eq.nome}</td>
                          <td className="px-4 py-3">{eq.categoria}</td>
                          <td className="px-4 py-3">
                            <Badge status={eq.status}>{eq.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chamados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chamados</CardTitle>
              <Button onClick={() => setModalChamado(true)} size="sm">
                + Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {chamados.length === 0 ? (
              <EmptyState
                title="Nenhum chamado"
                description="Comece criando um novo chamado"
                action={<Button onClick={() => setModalChamado(true)}>Criar Chamado</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left px-4 py-3 font-semibold">Título</th>
                      <th className="text-left px-4 py-3 font-semibold">Prioridade</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chamados.map((ch) => (
                      <tr key={ch.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                        <td className="px-4 py-3">{ch.titulo}</td>
                        <td className="px-4 py-3">
                          <Badge status={ch.prioridade}>{ch.prioridade}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={ch.status}>{ch.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manutenção (Técnico) */}
        {user?.nivel_acesso === "tecnico" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manutenção</CardTitle>
                <Button onClick={() => setModalManutencao(true)} size="sm">
                  + Registrar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {manutencoes.length === 0 ? (
                <EmptyState
                  title="Nenhuma manutenção registrada"
                  description="Comece registrando uma manutenção"
                  action={<Button onClick={() => setModalManutencao(true)}>Registrar Manutenção</Button>}
                />
              ) : (
                <div className="space-y-3">
                  {manutencoes.map((m) => (
                    <div key={m.id} className="p-4 border border-zinc-200 rounded-lg">
                      <p className="font-semibold text-zinc-900">{m.equipamento}</p>
                      <p className="text-sm text-zinc-600 mt-1">{m.descricao}</p>
                      <p className="text-xs text-zinc-500 mt-2">
                        {new Date(m.data_manutencao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Equipamento */}
      <ModalWithFooter
        isOpen={modalEquipamento}
        onClose={() => setModalEquipamento(false)}
        title="Novo Equipamento"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalEquipamento(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarEquipamento}>Criar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCriarEquipamento}>
          <FormGroup label="Nome">
            <Input
              value={novoEquipamento.nome}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, nome: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup label="Categoria">
            <Input
              value={novoEquipamento.categoria}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, categoria: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup label="Descrição">
            <Textarea
              value={novoEquipamento.descricao}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, descricao: e.target.value })}
            />
          </FormGroup>
        </form>
      </ModalWithFooter>

      {/* Modal Chamado */}
      <ModalWithFooter
        isOpen={modalChamado}
        onClose={() => setModalChamado(false)}
        title="Novo Chamado"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalChamado(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarChamado}>Criar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCriarChamado}>
          <FormGroup label="Título">
            <Input
              value={novoChamado.titulo}
              onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup label="Descrição">
            <Textarea
              value={novoChamado.descricao}
              onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup label="Equipamento">
            <Select
              value={novoChamado.equipamento_id}
              onChange={(e) => setNovoChamado({ ...novoChamado, equipamento_id: e.target.value })}
              required
            >
              <option value="">Selecione um equipamento</option>
              {equipamentos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Prioridade">
            <Select
              value={novoChamado.prioridade}
              onChange={(e) => setNovoChamado({ ...novoChamado, prioridade: e.target.value })}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </Select>
          </FormGroup>
        </form>
      </ModalWithFooter>

      {/* Modal Manutenção */}
      <ModalWithFooter
        isOpen={modalManutencao}
        onClose={() => setModalManutencao(false)}
        title="Registrar Manutenção"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalManutencao(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrarManutencao}>Registrar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleRegistrarManutencao}>
          <FormGroup label="Equipamento">
            <Select
              value={novaManutencao.equipamento_id}
              onChange={(e) => setNovaManutencao({ ...novaManutencao, equipamento_id: e.target.value })}
              required
            >
              <option value="">Selecione um equipamento</option>
              {equipamentos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Chamado">
            <Select
              value={novaManutencao.chamado_id}
              onChange={(e) => setNovaManutencao({ ...novaManutencao, chamado_id: e.target.value })}
              required
            >
              <option value="">Selecione um chamado</option>
              {chamados.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.titulo}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Descrição do Reparo">
            <Textarea
              value={novaManutencao.descricao}
              onChange={(e) => setNovaManutencao({ ...novaManutencao, descricao: e.target.value })}
              required
            />
          </FormGroup>
        </form>
      </ModalWithFooter>
    </main>
  );
}
