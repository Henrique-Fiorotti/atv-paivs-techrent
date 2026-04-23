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
import { Cpu, Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Carregando equipamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gerenciamento de Equipamentos"
        description="Crie e gerencie o inventário de equipamentos"
        action={
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} /> Novo Equipamento
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="subtle" className="text-center">
          <p className="text-sm text-slate-400 font-medium">Total</p>
          <p className="text-3xl font-bold text-white mt-2">{equipamentos.length}</p>
        </Card>
        <Card variant="subtle" className="text-center">
          <p className="text-sm text-emerald-300 font-medium">Operacionais</p>
          <p className="text-3xl font-bold text-emerald-300 mt-2">
            {equipamentos.filter((e) => e.status === "operacional").length}
          </p>
        </Card>
        <Card variant="subtle" className="text-center">
          <p className="text-sm text-amber-300 font-medium">Em Manutenção</p>
          <p className="text-3xl font-bold text-amber-300 mt-2">
            {equipamentos.filter((e) => e.status === "em_manutencao").length}
          </p>
        </Card>
        <Card variant="subtle" className="text-center">
          <p className="text-sm text-red-300 font-medium">Desativados</p>
          <p className="text-3xl font-bold text-red-300 mt-2">
            {equipamentos.filter((e) => e.status === "desativado").length}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu size={24} className="text-blue-400" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
          >
            Limpar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {equipamentosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                <Cpu size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum equipamento encontrado</h3>
              <p className="text-slate-400 mb-6">
                {equipamentos.length === 0
                  ? "Comece criando um novo equipamento"
                  : "Nenhum equipamento corresponde aos filtros"}
              </p>
              {equipamentos.length === 0 && (
                <Button onClick={() => setModalOpen(true)}>Criar Equipamento</Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="text-left px-4 py-4 font-semibold text-slate-300">Nome</th>
                    <th className="text-left px-4 py-4 font-semibold text-slate-300">Categoria</th>
                    <th className="text-left px-4 py-4 font-semibold text-slate-300">Patrimônio</th>
                    <th className="text-left px-4 py-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left px-4 py-4 font-semibold text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipamentosFiltrados.map((equip) => (
                    <tr key={equip.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-100">{equip.nome}</td>
                      <td className="px-4 py-4 text-slate-300">{equip.categoria}</td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-400">{equip.patrimonio}</td>
                      <td className="px-4 py-4">
                        <Badge status={equip.status}>{equip.status}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDeletarEquipamento(equip.id)}
                          className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
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
