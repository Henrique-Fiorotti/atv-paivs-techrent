"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const estadoInicialRegistro = {
  nome: "",
  email: "",
  senha: "",
  nivel_acesso: "cliente",
};

const cardClass = "rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur";
const inputClass = "w-full rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const btnClass = "rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.99]";

export default function Home() {
  const [authModo, setAuthModo] = useState("login");
  const [registro, setRegistro] = useState(estadoInicialRegistro);
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [token, setToken] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [mensagem, setMensagem] = useState("");

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

  const headers = useMemo(() => {
    const base = { "Content-Type": "application/json" };
    if (token) base.Authorization = `Bearer ${token}`;
    return base;
  }, [token]);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");
    if (tokenSalvo) setToken(tokenSalvo);
    if (usuarioSalvo) setUsuario(JSON.parse(usuarioSalvo));
  }, []);

  async function request(path, options = {}) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.message || data?.mensagem || "Erro na requisição");
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          "Falha de conexão com a API. Verifique CORS, URL do backend e se o servidor está ativo."
        );
      }
      throw error;
    }
  }

  async function handleRegistro(e) {
    e.preventDefault();
    try {
      const data = await request("/auth/registro", {
        method: "POST",
        body: JSON.stringify(registro),
      });
      setMensagem(data.message || "Usuário registrado com sucesso.");
      setRegistro(estadoInicialRegistro);
      setAuthModo("login");
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      setToken(data.token);
      setUsuario(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(payload));
      setMensagem("Login realizado com sucesso.");
    } catch (error) {
      setMensagem(error.message);
    }
  }

  function logout() {
    setToken("");
    setUsuario(null);
    setEquipamentos([]);
    setChamados([]);
    setManutencoes([]);
    setDashboard(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }

  async function carregarEquipamentos() {
    try {
      const data = await request("/equipamentos");
      setEquipamentos(data);
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function criarEquipamento(e) {
    e.preventDefault();
    try {
      await request("/equipamentos", {
        method: "POST",
        body: JSON.stringify(novoEquipamento),
      });
      setMensagem("Equipamento criado.");
      setNovoEquipamento({ nome: "", categoria: "", patrimonio: "", status: "operacional", descricao: "" });
      carregarEquipamentos();
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function criarChamado(e) {
    e.preventDefault();
    try {
      await request("/chamados", {
        method: "POST",
        body: JSON.stringify({
          ...novoChamado,
          equipamento_id: Number(novoChamado.equipamento_id),
        }),
      });
      setMensagem("Chamado criado.");
      setNovoChamado({ titulo: "", descricao: "", equipamento_id: "", prioridade: "media" });
      listarChamados();
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function listarChamados() {
    try {
      const data = await request("/chamados");
      setChamados(data);
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function atualizarStatus(chamadoId, status) {
    try {
      if (!chamadoId) return;
      await request(`/chamados/${chamadoId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setMensagem("Status atualizado.");
      listarChamados();
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function listarManutencao() {
    try {
      const data = await request("/manutencao");
      setManutencoes(data);
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function registrarManutencao(e) {
    e.preventDefault();
    try {
      await request("/manutencao", {
        method: "POST",
        body: JSON.stringify({
          ...novaManutencao,
          chamado_id: Number(novaManutencao.chamado_id),
          equipamento_id: Number(novaManutencao.equipamento_id),
        }),
      });
      setMensagem("Manutenção registrada.");
      setNovaManutencao({ chamado_id: "", equipamento_id: "", descricao: "" });
      listarManutencao();
      listarChamados();
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function carregarDashboardAdmin() {
    try {
      const data = await request("/dashboard/admin");
      setDashboard(data);
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function carregarDashboardTecnico() {
    try {
      const data = await request("/dashboard/tecnico");
      setDashboard({ painel: data });
    } catch (error) {
      setMensagem(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TechRent</h1>
            <p className="text-sm text-zinc-600">Plataforma de chamados, manutenção e gestão de ativos</p>
          </div>
          <div className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-medium text-white">API: {API_URL}</div>
        </header>

        {!usuario ? (
          <section className={`${cardClass} mx-auto w-full max-w-lg`}>
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
              <button
                className={`${btnClass} ${authModo === "login" ? "bg-white shadow text-zinc-900" : "text-zinc-600"}`}
                onClick={() => setAuthModo("login")}
              >
                Login
              </button>
              <button
                className={`${btnClass} ${authModo === "registro" ? "bg-white shadow text-zinc-900" : "text-zinc-600"}`}
                onClick={() => setAuthModo("registro")}
              >
                Registro
              </button>
            </div>

            {authModo === "login" ? (
              <form className="grid gap-3" onSubmit={handleLogin}>
                <input className={inputClass} placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                <input className={inputClass} placeholder="Senha" type="password" value={loginForm.senha} onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })} />
                <button className={`${btnClass} bg-emerald-600 text-white hover:bg-emerald-500`} type="submit">Entrar</button>
              </form>
            ) : (
              <form className="grid gap-3" onSubmit={handleRegistro}>
                <input className={inputClass} placeholder="Nome" value={registro.nome} onChange={(e) => setRegistro({ ...registro, nome: e.target.value })} />
                <input className={inputClass} placeholder="Email" value={registro.email} onChange={(e) => setRegistro({ ...registro, email: e.target.value })} />
                <input className={inputClass} placeholder="Senha" type="password" value={registro.senha} onChange={(e) => setRegistro({ ...registro, senha: e.target.value })} />
                <select className={inputClass} value={registro.nivel_acesso} onChange={(e) => setRegistro({ ...registro, nivel_acesso: e.target.value })}>
                  <option value="cliente">Cliente</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Admin</option>
                </select>
                <button className={`${btnClass} bg-blue-600 text-white hover:bg-blue-500`} type="submit">Criar conta</button>
              </form>
            )}
          </section>
        ) : (
          <>
            <section className={`${cardClass} flex flex-wrap items-center gap-2`}>
              <p className="mr-auto text-sm">
                Logado como <strong>{usuario.nome}</strong> ({usuario.nivel_acesso})
              </p>
              <button className={`${btnClass} border border-zinc-200 bg-white hover:bg-zinc-50`} onClick={logout}>Sair</button>
              <button className={`${btnClass} border border-zinc-200 bg-white hover:bg-zinc-50`} onClick={carregarEquipamentos}>Equipamentos</button>
              <button className={`${btnClass} border border-zinc-200 bg-white hover:bg-zinc-50`} onClick={listarChamados}>Chamados</button>
              {(usuario.nivel_acesso === "admin" || usuario.nivel_acesso === "tecnico") && (
                <button className={`${btnClass} border border-zinc-200 bg-white hover:bg-zinc-50`} onClick={listarManutencao}>Manutenções</button>
              )}
              {usuario.nivel_acesso === "admin" && (
                <button className={`${btnClass} border border-zinc-200 bg-white hover:bg-zinc-50`} onClick={carregarDashboardAdmin}>Dashboard admin</button>
              )}
              {(usuario.nivel_acesso === "admin" || usuario.nivel_acesso === "tecnico") && (
                <button className={`${btnClass} border border-zinc-200 bg-white hover:bg-zinc-50`} onClick={carregarDashboardTecnico}>Painel técnico</button>
              )}
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {usuario.nivel_acesso === "admin" && (
                <section className={cardClass}>
                  <h2 className="mb-3 text-lg font-semibold">Novo equipamento</h2>
                  <form className="grid gap-2" onSubmit={criarEquipamento}>
                    <input className={inputClass} placeholder="Nome" value={novoEquipamento.nome} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, nome: e.target.value })} />
                    <input className={inputClass} placeholder="Categoria" value={novoEquipamento.categoria} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, categoria: e.target.value })} />
                    <input className={inputClass} placeholder="Patrimônio" value={novoEquipamento.patrimonio} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, patrimonio: e.target.value })} />
                    <select className={inputClass} value={novoEquipamento.status} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, status: e.target.value })}>
                      <option value="operacional">Operacional</option>
                      <option value="em_manutencao">Em manutenção</option>
                      <option value="desativado">Desativado</option>
                    </select>
                    <textarea className={inputClass} placeholder="Descrição" value={novoEquipamento.descricao} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, descricao: e.target.value })} />
                    <button className={`${btnClass} bg-indigo-600 text-white hover:bg-indigo-500`}>Salvar equipamento</button>
                  </form>
                </section>
              )}

              {(usuario.nivel_acesso === "cliente" || usuario.nivel_acesso === "admin") && (
                <section className={cardClass}>
                  <h2 className="mb-3 text-lg font-semibold">Abrir chamado</h2>
                  <form className="grid gap-2" onSubmit={criarChamado}>
                    <input className={inputClass} placeholder="Título" value={novoChamado.titulo} onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })} />
                    <input className={inputClass} placeholder="ID do equipamento" value={novoChamado.equipamento_id} onChange={(e) => setNovoChamado({ ...novoChamado, equipamento_id: e.target.value })} />
                    <select className={inputClass} value={novoChamado.prioridade} onChange={(e) => setNovoChamado({ ...novoChamado, prioridade: e.target.value })}>
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                    <textarea className={inputClass} placeholder="Descrição" value={novoChamado.descricao} onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })} />
                    <button className={`${btnClass} bg-orange-600 text-white hover:bg-orange-500`}>Abrir chamado</button>
                  </form>
                </section>
              )}

              {usuario.nivel_acesso === "tecnico" && (
                <section className={cardClass}>
                  <h2 className="mb-3 text-lg font-semibold">Registrar manutenção</h2>
                  <form className="grid gap-2" onSubmit={registrarManutencao}>
                    <input className={inputClass} placeholder="ID chamado" value={novaManutencao.chamado_id} onChange={(e) => setNovaManutencao({ ...novaManutencao, chamado_id: e.target.value })} />
                    <input className={inputClass} placeholder="ID equipamento" value={novaManutencao.equipamento_id} onChange={(e) => setNovaManutencao({ ...novaManutencao, equipamento_id: e.target.value })} />
                    <textarea className={inputClass} placeholder="Descrição do reparo" value={novaManutencao.descricao} onChange={(e) => setNovaManutencao({ ...novaManutencao, descricao: e.target.value })} />
                    <button className={`${btnClass} bg-teal-600 text-white hover:bg-teal-500`}>Registrar</button>
                  </form>
                </section>
              )}
            </div>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className={cardClass}>
                <h2 className="mb-2 text-lg font-semibold">Equipamentos</h2>
                <pre className="max-h-80 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">{JSON.stringify(equipamentos, null, 2)}</pre>
              </div>
              <div className={cardClass}>
                <h2 className="mb-2 text-lg font-semibold">Chamados</h2>
                <div className="mb-2 flex flex-wrap gap-2">
                  {(usuario.nivel_acesso === "admin" || usuario.nivel_acesso === "tecnico") && (
                    <>
                      <button className={`${btnClass} border border-zinc-300 bg-white hover:bg-zinc-50`} onClick={() => atualizarStatus(prompt("ID do chamado"), "em_atendimento")}>Em atendimento</button>
                      <button className={`${btnClass} border border-zinc-300 bg-white hover:bg-zinc-50`} onClick={() => atualizarStatus(prompt("ID do chamado"), "resolvido")}>Resolvido</button>
                      <button className={`${btnClass} border border-zinc-300 bg-white hover:bg-zinc-50`} onClick={() => atualizarStatus(prompt("ID do chamado"), "cancelado")}>Cancelar</button>
                    </>
                  )}
                </div>
                <pre className="max-h-80 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">{JSON.stringify(chamados, null, 2)}</pre>
              </div>
              <div className={cardClass}>
                <h2 className="mb-2 text-lg font-semibold">Histórico de manutenção</h2>
                <pre className="max-h-80 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">{JSON.stringify(manutencoes, null, 2)}</pre>
              </div>
              <div className={cardClass}>
                <h2 className="mb-2 text-lg font-semibold">Dashboard</h2>
                <pre className="max-h-80 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">{JSON.stringify(dashboard, null, 2)}</pre>
              </div>
            </section>
          </>
        )}

        {mensagem && (
          <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950 shadow-sm">{mensagem}</p>
        )}
      </div>
    </main>
  );
}
