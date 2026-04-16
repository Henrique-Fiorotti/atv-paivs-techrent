"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/contexts/ToastContext";
import { chamadosAPI, equipamentosAPI } from "@/lib/api";
import { chamadoSchema, filtrosChamadosSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/Form";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { ModalWithFooter } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";

export default function ChamadosPage() {
  const { showSuccess, showError } = useToast();
  const [chamados, setChamados] = useState([]);
  const [chamadosFiltrados, setChamadosFiltrados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  // Form para criar chamado
  const {
    control: controlCriar,
    handleSubmit: handleSubmitCriar,
    reset: resetCriar,
    formState: { errors: errorsCriar, isSubmitting: isSubmittingCriar },
  } = useForm({
    resolver: zodResolver(chamadoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      equipamento_id: "",
      prioridade: "media",
    },
  });

  // Form para filtros
  const {
    control: controlFiltros,
    watch: watchFiltros,
    reset: resetFiltros,
  } = useForm({
    resolver: zodResolver(filtrosChamadosSchema),
    defaultValues: {
      busca: "",
      status: "",
      prioridade: "",
    },
  });

  const filtros = watchFiltros();

  useEffect(() => {
    carregarDados();
  }, []);

  // Aplicar filtros quando mudam
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, chamados]);

  async function carregarDados() {
    try {
      setLoading(true);
      const [chamRes, equipRes] = await Promise.all([
        chamadosAPI.getAll(),
        equipamentosAPI.getAll(),
      ]);
      setChamados(chamRes);
      setEquipamentos(equipRes);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let resultado = chamados;

    if (filtros.busca) {
      resultado = resultado.filter(
        (ch) =>
          ch.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          ch.descricao.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    if (filtros.status) {
      resultado = resultado.filter((ch) => ch.status === filtros.status);
    }

    if (filtros.prioridade) {
      resultado = resultado.filter((ch) => ch.prioridade === filtros.prioridade);
    }

    setChamadosFiltrados(resultado);
  }

  async function onSubmitCriar(data) {
    try {
      await chamadosAPI.create({
        ...data,
        equipamento_id: Number(data.equipamento_id),
      });
      showSuccess("Chamado criado com sucesso!");
      resetCriar();
      setModalOpen(false);
      carregarDados();
    } catch (error) {
      showError(error.message);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Carregando chamados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Chamados"
        description="Acompanhe o status de seus chamados"
        action={<Button onClick={() => setModalOpen(true)}>+ Novo Chamado</Button>}
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
              placeholder="Título ou descrição..."
            />
            <FormField
              control={controlFiltros}
              name="status"
              label="Status"
              isSelect
              options={[
                { value: "", label: "Todos" },
                { value: "aberto", label: "Aberto" },
                { value: "em_atendimento", label: "Em Atendimento" },
                { value: "resolvido", label: "Resolvido" },
                { value: "cancelado", label: "Cancelado" },
              ]}
            />
            <FormField
              control={controlFiltros}
              name="prioridade"
              label="Prioridade"
              isSelect
              options={[
                { value: "", label: "Todas" },
                { value: "baixa", label: "Baixa" },
                { value: "media", label: "Média" },
                { value: "alta", label: "Alta" },
              ]}
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
          {chamadosFiltrados.length === 0 ? (
            <EmptyState
              title="Nenhum chamado encontrado"
              description={
                chamados.length === 0
                  ? "Você ainda não abriu nenhum chamado"
                  : "Nenhum chamado corresponde aos filtros"
              }
              action={chamados.length === 0 && <Button onClick={() => setModalOpen(true)}>Criar Chamado</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="text-left px-4 py-3 font-semibold">Título</th>
                    <th className="text-left px-4 py-3 font-semibold">Equipamento</th>
                    <th className="text-left px-4 py-3 font-semibold">Prioridade</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {chamadosFiltrados.map((chamado) => (
                    <tr key={chamado.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">{chamado.titulo}</td>
                      <td className="px-4 py-3">{chamado.equipamento}</td>
                      <td className="px-4 py-3">
                        <Badge status={chamado.prioridade}>{chamado.prioridade}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={chamado.status}>{chamado.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setChamadoSelecionado(chamado);
                            setDetalhesOpen(true);
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Novo Chamado */}
      <ModalWithFooter
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Chamado"
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
            name="titulo"
            label="Título"
            placeholder="Descreva o problema brevemente"
            error={errorsCriar.titulo}
            required
          />
          <FormField
            control={controlCriar}
            name="descricao"
            label="Descrição"
            isTextarea
            placeholder="Detalhes do problema..."
            error={errorsCriar.descricao}
            required
          />
          <FormField
            control={controlCriar}
            name="equipamento_id"
            label="Equipamento"
            isSelect
            options={equipamentos.map((eq) => ({
              value: eq.id,
              label: `${eq.nome} (${eq.categoria})`,
            }))}
            error={errorsCriar.equipamento_id}
            required
          />
          <FormField
            control={controlCriar}
            name="prioridade"
            label="Prioridade"
            isSelect
            options={[
              { value: "baixa", label: "Baixa" },
              { value: "media", label: "Média" },
              { value: "alta", label: "Alta" },
            ]}
            error={errorsCriar.prioridade}
          />
        </form>
      </ModalWithFooter>

      {/* Modal Detalhes */}
      {chamadoSelecionado && (
        <ModalWithFooter
          isOpen={detalhesOpen}
          onClose={() => setDetalhesOpen(false)}
          title={chamadoSelecionado.titulo}
          footer={
            <Button variant="outline" onClick={() => setDetalhesOpen(false)}>
              Fechar
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600">Equipamento</p>
              <p className="font-semibold">{chamadoSelecionado.equipamento}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Descrição</p>
              <p>{chamadoSelecionado.descricao}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600">Prioridade</p>
                <Badge status={chamadoSelecionado.prioridade}>{chamadoSelecionado.prioridade}</Badge>
              </div>
              <div>
                <p className="text-sm text-zinc-600">Status</p>
                <Badge status={chamadoSelecionado.status}>{chamadoSelecionado.status}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Técnico Responsável</p>
              <p className="font-semibold">{chamadoSelecionado.tecnico_responsavel || "Não atribuído"}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Aberto em</p>
              <p>{new Date(chamadoSelecionado.aberto_em).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </ModalWithFooter>
      )}
    </div>
  );
}
