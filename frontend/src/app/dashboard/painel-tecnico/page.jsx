"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/contexts/ToastContext";
import { dashboardAPI, chamadosAPI, manutencaoAPI } from "@/lib/api";
import { manutencaoSchema } from "@/lib/schemas";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Form";
import { ModalWithFooter } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";

export default function PainelTecnico() {
  const { showSuccess, showError } = useToast();
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(manutencaoSchema),
    defaultValues: {
      chamado_id: "",
      equipamento_id: "",
      descricao: "",
    },
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const chamRes = await dashboardAPI.getTecnico();
      setChamados(chamRes || []);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAtenderChamado(chamado) {
    try {
      await chamadosAPI.updateStatus(chamado.id, "em_atendimento");
      showSuccess("Chamado marcado como em atendimento!");
      carregarDados();
    } catch (error) {
      showError(error.message);
    }
  }

  async function onSubmit(data) {
    if (!chamadoSelecionado) return;

    try {
      // Registrar manutenção
      await manutencaoAPI.create({
        chamado_id: chamadoSelecionado.chamado_id,
        equipamento_id: chamadoSelecionado.equipamento_id,
        descricao: data.descricao,
      });

      // Atualizar status do chamado
      await chamadosAPI.updateStatus(chamadoSelecionado.chamado_id, "resolvido");

      showSuccess("Chamado finalizado com sucesso!");
      reset();
      setModalOpen(false);
      setChamadoSelecionado(null);
      carregarDados();
    } catch (error) {
      showError(error.message);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel do Técnico"
        description="Chamados abertos e em atendimento"
      />

      <Card>
        <CardContent>
          {chamados.length === 0 ? (
            <EmptyState
              title="Nenhum chamado pendente"
              description="Todos os chamados foram resolvidos"
            />
          ) : (
            <div className="space-y-4">
              {chamados.map((chamado) => (
                <div
                  key={chamado.chamado_id}
                  className="p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{chamado.titulo}</h3>
                      <p className="text-sm text-zinc-600 mt-1">{chamado.descricao}</p>
                    </div>
                    <Badge status={chamado.prioridade}>{chamado.prioridade}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-zinc-600">Cliente</p>
                      <p className="font-semibold">{chamado.solicitante}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Equipamento</p>
                      <p className="font-semibold">{chamado.equipamento}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Categoria</p>
                      <p className="font-semibold">{chamado.categoria}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600">Patrimônio</p>
                      <p className="font-semibold">{chamado.patrimonio}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {chamado.status === "aberto" && (
                      <Button
                        size="sm"
                        onClick={() => handleAtenderChamado(chamado)}
                      >
                        Atender
                      </Button>
                    )}
                    {chamado.status === "em_atendimento" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setChamadoSelecionado(chamado);
                          reset({
                            chamado_id: chamado.chamado_id,
                            equipamento_id: chamado.equipamento_id,
                            descricao: "",
                          });
                          setModalOpen(true);
                        }}
                      >
                        Finalizar
                      </Button>
                    )}
                    <Badge status={chamado.status}>{chamado.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Finalizar Chamado */}
      <ModalWithFooter
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Finalizar Chamado"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Finalizando..." : "Finalizar"}
            </Button>
          </>
        }
      >
        {chamadoSelecionado && (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="p-4 bg-zinc-50 rounded-lg">
              <p className="text-sm text-zinc-600">Chamado</p>
              <p className="font-semibold">{chamadoSelecionado.titulo}</p>
            </div>
            <FormField
              control={control}
              name="descricao"
              label="Descrição do Reparo"
              isTextarea
              placeholder="Descreva o que foi feito..."
              error={errors.descricao}
              required
            />
          </form>
        )}
      </ModalWithFooter>
    </div>
  );
}
