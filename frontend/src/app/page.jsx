"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const estadoInicialRegistro = {
  nome: "",
  email: "",
  senha: "",
  nivel_acesso: "cliente",
};

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
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.mensagem || "Erro na requisição");
    return data;
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">TechRent - Front-end MVP</h1>
      <p className="text-sm text-zinc-600">API: {API_URL}</p>

      {!usuario ? (
        <section className="grid gap-4 rounded border border-zinc-200 p-4">
          <div className="flex gap-2">
            <button className="rounded bg-zinc-900 px-3 py-2 text-white" onClick={() => setAuthModo("login")}>
              Login
            </button>
            <button className="rounded border px-3 py-2" onClick={() => setAuthModo("registro")}>
              Registro
            </button>
          </div>

          {authModo === "login" ? (
            <form className="grid gap-2" onSubmit={handleLogin}>
              <input className="rounded border p-2" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              <input className="rounded border p-2" placeholder="Senha" type="password" value={loginForm.senha} onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })} />
              <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="submit">Entrar</button>
            </form>
          ) : (
            <form className="grid gap-2" onSubmit={handleRegistro}>
              <input className="rounded border p-2" placeholder="Nome" value={registro.nome} onChange={(e) => setRegistro({ ...registro, nome: e.target.value })} />
              <input className="rounded border p-2" placeholder="Email" value={registro.email} onChange={(e) => setRegistro({ ...registro, email: e.target.value })} />
              <input className="rounded border p-2" placeholder="Senha" type="password" value={registro.senha} onChange={(e) => setRegistro({ ...registro, senha: e.target.value })} />
              <select className="rounded border p-2" value={registro.nivel_acesso} onChange={(e) => setRegistro({ ...registro, nivel_acesso: e.target.value })}>
                <option value="cliente">Cliente</option>
                <option value="tecnico">Técnico</option>
                <option value="admin">Admin</option>
              </select>
              <button className="rounded bg-blue-600 px-3 py-2 text-white" type="submit">Criar conta</button>
            </form>
          )}
        </section>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-3 rounded border border-zinc-200 p-4">
            <p>
              <strong>{usuario.nome}</strong> ({usuario.nivel_acesso})
            </p>
            <button className="rounded border px-3 py-2" onClick={logout}>Sair</button>
            <button className="rounded border px-3 py-2" onClick={carregarEquipamentos}>Listar equipamentos</button>
            <button className="rounded border px-3 py-2" onClick={listarChamados}>Listar chamados</button>
            {(usuario.nivel_acesso === "admin" || usuario.nivel_acesso === "tecnico") && (
              <button className="rounded border px-3 py-2" onClick={listarManutencao}>Listar manutenções</button>
            )}
            {usuario.nivel_acesso === "admin" && (
              <button className="rounded border px-3 py-2" onClick={carregarDashboardAdmin}>Dashboard admin</button>
            )}
            {(usuario.nivel_acesso === "admin" || usuario.nivel_acesso === "tecnico") && (
              <button className="rounded border px-3 py-2" onClick={carregarDashboardTecnico}>Painel técnico</button>
            )}
          </section>

          {usuario.nivel_acesso === "admin" && (
            <section className="grid gap-2 rounded border border-zinc-200 p-4">
              <h2 className="font-semibold">Novo equipamento</h2>
              <form className="grid gap-2 md:grid-cols-2" onSubmit={criarEquipamento}>
                <input className="rounded border p-2" placeholder="Nome" value={novoEquipamento.nome} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, nome: e.target.value })} />
                <input className="rounded border p-2" placeholder="Categoria" value={novoEquipamento.categoria} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, categoria: e.target.value })} />
                <input className="rounded border p-2" placeholder="Patrimônio" value={novoEquipamento.patrimonio} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, patrimonio: e.target.value })} />
                <select className="rounded border p-2" value={novoEquipamento.status} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, status: e.target.value })}>
                  <option value="operacional">Operacional</option>
                  <option value="em_manutencao">Em manutenção</option>
                  <option value="desativado">Desativado</option>
                </select>
                <textarea className="rounded border p-2 md:col-span-2" placeholder="Descrição" value={novoEquipamento.descricao} onChange={(e) => setNovoEquipamento({ ...novoEquipamento, descricao: e.target.value })} />
                <button className="rounded bg-indigo-600 px-3 py-2 text-white md:col-span-2">Salvar equipamento</button>
              </form>
            </section>
          )}

          {(usuario.nivel_acesso === "cliente" || usuario.nivel_acesso === "admin") && (
            <section className="grid gap-2 rounded border border-zinc-200 p-4">
              <h2 className="font-semibold">Abrir chamado</h2>
              <form className="grid gap-2 md:grid-cols-2" onSubmit={criarChamado}>
                <input className="rounded border p-2" placeholder="Título" value={novoChamado.titulo} onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })} />
                <input className="rounded border p-2" placeholder="ID do equipamento" value={novoChamado.equipamento_id} onChange={(e) => setNovoChamado({ ...novoChamado, equipamento_id: e.target.value })} />
                <select className="rounded border p-2" value={novoChamado.prioridade} onChange={(e) => setNovoChamado({ ...novoChamado, prioridade: e.target.value })}>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
                <textarea className="rounded border p-2 md:col-span-2" placeholder="Descrição" value={novoChamado.descricao} onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })} />
                <button className="rounded bg-orange-600 px-3 py-2 text-white md:col-span-2">Abrir chamado</button>
              </form>
            </section>
          )}

          {usuario.nivel_acesso === "tecnico" && (
            <section className="grid gap-2 rounded border border-zinc-200 p-4">
              <h2 className="font-semibold">Registrar manutenção</h2>
              <form className="grid gap-2 md:grid-cols-2" onSubmit={registrarManutencao}>
                <input className="rounded border p-2" placeholder="ID chamado" value={novaManutencao.chamado_id} onChange={(e) => setNovaManutencao({ ...novaManutencao, chamado_id: e.target.value })} />
                <input className="rounded border p-2" placeholder="ID equipamento" value={novaManutencao.equipamento_id} onChange={(e) => setNovaManutencao({ ...novaManutencao, equipamento_id: e.target.value })} />
                <textarea className="rounded border p-2 md:col-span-2" placeholder="Descrição do reparo" value={novaManutencao.descricao} onChange={(e) => setNovaManutencao({ ...novaManutencao, descricao: e.target.value })} />
                <button className="rounded bg-teal-600 px-3 py-2 text-white md:col-span-2">Registrar</button>
              </form>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded border border-zinc-200 p-4">
              <h2 className="mb-2 font-semibold">Equipamentos</h2>
              <pre className="max-h-80 overflow-auto rounded bg-zinc-100 p-2 text-xs">{JSON.stringify(equipamentos, null, 2)}</pre>
            </div>
            <div className="rounded border border-zinc-200 p-4">
              <h2 className="mb-2 font-semibold">Chamados</h2>
              <div className="mb-2 flex flex-wrap gap-2">
                {(usuario.nivel_acesso === "admin" || usuario.nivel_acesso === "tecnico") && (
                  <>
                    <button className="rounded border px-2 py-1 text-sm" onClick={() => atualizarStatus(prompt("ID do chamado"), "em_atendimento")}>Marcar em atendimento</button>
                    <button className="rounded border px-2 py-1 text-sm" onClick={() => atualizarStatus(prompt("ID do chamado"), "resolvido")}>Marcar resolvido</button>
                    <button className="rounded border px-2 py-1 text-sm" onClick={() => atualizarStatus(prompt("ID do chamado"), "cancelado")}>Cancelar chamado</button>
                  </>
                )}
              </div>
              <pre className="max-h-80 overflow-auto rounded bg-zinc-100 p-2 text-xs">{JSON.stringify(chamados, null, 2)}</pre>
            </div>
            <div className="rounded border border-zinc-200 p-4">
              <h2 className="mb-2 font-semibold">Histórico de manutenção</h2>
              <pre className="max-h-80 overflow-auto rounded bg-zinc-100 p-2 text-xs">{JSON.stringify(manutencoes, null, 2)}</pre>
            </div>
            <div className="rounded border border-zinc-200 p-4">
              <h2 className="mb-2 font-semibold">Dashboard</h2>
              <pre className="max-h-80 overflow-auto rounded bg-zinc-100 p-2 text-xs">{JSON.stringify(dashboard, null, 2)}</pre>
            </div>
          </section>
        </>
      )}

      {mensagem && <p className="rounded bg-zinc-100 p-3 text-sm">{mensagem}</p>}
    </main>
  );
}
