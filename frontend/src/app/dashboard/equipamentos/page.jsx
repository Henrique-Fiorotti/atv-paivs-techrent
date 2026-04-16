"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { equipamentosAPI } from "@/lib/api";
import { equipamentoSchema, filtrosEquipamentosSchema } from "@/lib/schemas";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { Button, Input } from "@/components/ui/Form";
import { ModalWithFooter } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";

export default function EquipamentosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamentosFiltrados, setEquipamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form para criar equipamento
  const {
    control: controlCriar,
    handleSubmit: handleSubmitCriar,
    reset: resetCriar,
    formState: { errors: errorsCriar, isSubmitting: isSubmittingCriar },
  } = useForm({
    resolver: zodResolver(equipamentoSchema),
    defaultValues: {
      nome: "",
      categoria: "",
      patrimonio: "",
      status: "operacional",
      descricao: "",
    },
  });

  // Form para filtros
  const {
    control: controlFiltros,
    watch: watchFiltros,
    reset: resetFiltros,
  } = useForm({
    resolver: zodResolver(filtrosEquipamentosSchema),
    defaultValues: {
      busca: "",
      status: "",
      categoria: "",
    },
  });

  const filtros = watchFiltros();

  // Proteger rota - apenas admin
  useEffect(() => {
    if (user && user.nivel_acesso !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  // Aplicar filtros quando mudam
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, equipamentos]);

  async function carregarEquipamentos() {
    try {
      setLoading(true);
      const res = await equipamentosAPI.getAll();
      setEquipamentos(res);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let resultado = equipamentos;

    if (filtros.busca) {
      resultado = resultado.filter(
        (eq) =>
          eq.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          eq.categoria.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          eq.patrimonio.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    if (filtros.status) {
      resultado = resultado.filter((eq) => eq.status === filtros.status);
    }

    if (filtros.categoria) {
      resultado = resultado.filter((eq) =>
        eq.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())
      );
    }

    setEquipamentosFiltrados(resultado);
  }

  async function onSubmitCriar(data) {
    try {
      await equipamentosAPI.create(data);
      showSuccess("Equipamento criado com sucesso!");
      resetCriar();
      setModalOpen(false);
      carregarEquipamentos();
    } catch (error) {
      showError(error.message);
    }
  }

  async function handleDeletarEquipamento(id) {
    if (!confirm("Tem certeza que deseja deletar este equipamento?")) return;

    try {
      await equipamentosAPI.delete(id);
      showSuccess("Equipamento deletado com sucesso!");
      carregarEquipamentos();
    } catch (error) {
      showError(error.message);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Carregando equipamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciamento de Equipamentos"
        description="Crie e gerencie o inventário de equipamentos"
        action={<Button onClick={() => setModalOpen(true)}>+ Novo Equipamento</Button>}
      />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={controlFiltros}
              name="busca"
              label="Buscar"
              placeholder="Nome, categoria ou patrimônio..."
            />
            <FormField
              control={controlFiltros}
              name="status"
              label="Status"
              isSelect
              options={[
                { value: "", label: "Todos" },
                { value: "operacional", label: "Operacional" },
                { value: "em_manutencao", label: "Em Manutenção" },
                { value: "desativado", label: "Desativado" },
              ]}
            />
            <FormField
              control={controlFiltros}
              name="categoria"
              label="Categoria"
              placeholder="Filtrar por categoria..."
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => resetFiltros()}
            className="mt-4"
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent>
          {equipamentosFiltrados.length === 0 ? (
            <EmptyState
              title="Nenhum equipamento encontrado"
              description={
                equipamentos.length === 0
                  ? "Comece criando um novo equipamento"
                  : "Nenhum equipamento corresponde aos filtros"
              }
              action={equipamentos.length === 0 && <Button onClick={() => setModalOpen(true)}>Criar Equipamento</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="text-left px-4 py-3 font-semibold">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold">Categoria</th>
                    <th className="text-left px-4 py-3 font-semibold">Patrimônio</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipamentosFiltrados.map((equip) => (
                    <tr key={equip.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">{equip.nome}</td>
                      <td className="px-4 py-3">{equip.categoria}</td>
                      <td className="px-4 py-3 text-xs font-mono">{equip.patrimonio}</td>
                      <td className="px-4 py-3">
                        <Badge status={equip.status}>{equip.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeletarEquipamento(equip.id)}
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

      {/* Modal Novo Equipamento */}
      <ModalWithFooter
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Equipamento"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitCriar(onSubmitCriar)} disabled={isSubmittingCriar}>
              {isSubmittingCriar ? "Criando..." : "Criar"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmitCriar(onSubmitCriar)}>
          <FormField
            control={controlCriar}
            name="nome"
            label="Nome"
            placeholder="Ex: Notebook Dell Latitude"
            error={errorsCriar.nome}
            required
          />
          <FormField
            control={controlCriar}
            name="categoria"
            label="Categoria"
            placeholder="Ex: Notebook, Projetor, Impressora"
            error={errorsCriar.categoria}
            required
          />
          <FormField
            control={controlCriar}
            name="patrimonio"
            label="Patrimônio"
            placeholder="Ex: PAT-001234"
            error={errorsCriar.patrimonio}
            required
          />
          <FormField
            control={controlCriar}
            name="status"
            label="Status"
            isSelect
            options={[
              { value: "operacional", label: "Operacional" },
              { value: "em_manutencao", label: "Em Manutenção" },
              { value: "desativado", label: "Desativado" },
            ]}
            error={errorsCriar.status}
          />
          <FormField
            control={controlCriar}
            name="descricao"
            label="Descrição"
            isTextarea
            placeholder="Detalhes do equipamento..."
            error={errorsCriar.descricao}
          />
        </form>
      </ModalWithFooter>
    </div>
  );
}
