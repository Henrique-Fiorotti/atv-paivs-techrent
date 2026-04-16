// Cliente HTTP centralizado para TechRent
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
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

// Endpoints de autenticação
export const authAPI = {
  login: (email, senha) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),
  registro: (nome, email, senha, nivel_acesso = "cliente") =>
    request("/auth/registro", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha, nivel_acesso }),
    }),
};

// Endpoints de usuários
export const usuariosAPI = {
  getAll: () => request("/usuarios"),
  getById: (id) => request(`/usuarios/${id}`),
  create: (data) =>
    request("/usuarios", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/usuarios/${id}`, {
      method: "DELETE",
    }),
};

// Endpoints de equipamentos
export const equipamentosAPI = {
  getAll: () => request("/equipamentos"),
  getById: (id) => request(`/equipamentos/${id}`),
  create: (data) =>
    request("/equipamentos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/equipamentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/equipamentos/${id}`, {
      method: "DELETE",
    }),
};

// Endpoints de chamados
export const chamadosAPI = {
  getAll: () => request("/chamados"),
  getById: (id) => request(`/chamados/${id}`),
  create: (data) =>
    request("/chamados", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/chamados/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateStatus: (id, status) =>
    request(`/chamados/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  delete: (id) =>
    request(`/chamados/${id}`, {
      method: "DELETE",
    }),
};

// Endpoints de manutenção
export const manutencaoAPI = {
  getAll: () => request("/manutencao"),
  getById: (id) => request(`/manutencao/${id}`),
  create: (data) =>
    request("/manutencao", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHistorico: (equipamentoId) =>
    request(`/manutencao/equipamento/${equipamentoId}`),
};

// Endpoints de dashboard
export const dashboardAPI = {
  getAdmin: () => request("/dashboard/admin"),
  getTecnico: () => request("/dashboard/tecnico"),
};

export default request;
