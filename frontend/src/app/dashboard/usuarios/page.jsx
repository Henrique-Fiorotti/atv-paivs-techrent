"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { usuariosAPI, authAPI } from "@/lib/api";
import { usuarioSchema } from "@/lib/schemas";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Form";
import { ModalWithFooter } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";

export default function UsuariosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      nivel_acesso: "cliente",
    },
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

  async function onSubmit(data) {
    try {
      await authAPI.registro(data.nome, data.email, data.senha, data.nivel_acesso);
      showSuccess("Usuário criado com sucesso!");
      reset();
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
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            control={control}
            name="nome"
            label="Nome"
            placeholder="Nome completo"
            error={errors.nome}
            required
          />
          <FormField
            control={control}
            name="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
            error={errors.email}
            required
          />
          <FormField
            control={control}
            name="senha"
            label="Senha"
            type="password"
            placeholder="Senha segura"
            error={errors.senha}
            required
          />
          <FormField
            control={control}
            name="nivel_acesso"
            label="Nível de Acesso"
            isSelect
            options={[
              { value: "cliente", label: "Cliente" },
              { value: "tecnico", label: "Técnico" },
              { value: "admin", label: "Admin" },
            ]}
            error={errors.nivel_acesso}
          />
        </form>
      </ModalWithFooter>
    </div>
  );
}
