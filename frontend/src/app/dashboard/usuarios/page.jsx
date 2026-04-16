"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { usuariosAPI, authAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { Button, Input, Select, FormGroup } from "@/components/ui/Form";
import { ModalWithFooter } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    nivel_acesso: "cliente",
  });

  // Proteger rota - apenas admin
  useEffect(() => {
    if (user && user.nivel_acesso !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setLoading(true);
      const res = await usuariosAPI.getAll();
      setUsuarios(res);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarUsuario(e) {
    e.preventDefault();
    try {
      await authAPI.registro(
        novoUsuario.nome,
        novoUsuario.email,
        novoUsuario.senha,
        novoUsuario.nivel_acesso
      );
      showSuccess("Usuário criado com sucesso!");
      setNovoUsuario({ nome: "", email: "", senha: "", nivel_acesso: "cliente" });
      setModalOpen(false);
      carregarUsuarios();
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleDeletarUsuario(id) {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

    try {
      await usuariosAPI.delete(id);
      showSuccess("Usuário deletado com sucesso!");
      carregarUsuarios();
    } catch (error) {
      showError(error.message);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Crie e gerencie usuários do sistema"
        action={<Button onClick={() => setModalOpen(true)}>+ Novo Usuário</Button>}
      />

      <Card>
        <CardContent>
          {usuarios.length === 0 ? (
            <EmptyState
              title="Nenhum usuário"
              description="Comece criando um novo usuário"
              action={<Button onClick={() => setModalOpen(true)}>Criar Usuário</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="text-left px-4 py-3 font-semibold">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">Nível de Acesso</th>
                    <th className="text-left px-4 py-3 font-semibold">Criado em</th>
                    <th className="text-left px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">{usuario.nome}</td>
                      <td className="px-4 py-3">{usuario.email}</td>
                      <td className="px-4 py-3">
                        <Badge status={usuario.nivel_acesso}>{usuario.nivel_acesso}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(usuario.criado_em).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeletarUsuario(usuario.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Novo Usuário */}
      <ModalWithFooter
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Usuário"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarUsuario}>Criar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCriarUsuario}>
          <FormGroup label="Nome">
            <Input
              value={novoUsuario.nome}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </FormGroup>
          <FormGroup label="Email">
            <Input
              type="email"
              value={novoUsuario.email}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </FormGroup>
          <FormGroup label="Senha">
            <Input
              type="password"
              value={novoUsuario.senha}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
              placeholder="Senha segura"
              required
            />
          </FormGroup>
          <FormGroup label="Nível de Acesso">
            <Select
              value={novoUsuario.nivel_acesso}
              onChange={(e) => setNovoUsuario({ ...novoUsuario, nivel_acesso: e.target.value })}
            >
              <option value="cliente">Cliente</option>
              <option value="tecnico">Técnico</option>
              <option value="admin">Admin</option>
            </Select>
          </FormGroup>
        </form>
      </ModalWithFooter>
    </div>
  );
}
