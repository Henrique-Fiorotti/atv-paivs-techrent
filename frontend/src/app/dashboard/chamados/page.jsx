"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { chamadosAPI, equipamentosAPI } from "@/lib/api";
import { Button } from "@/components/ui/Form";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { ModalWithFooter } from "@/components/ui/Modal";
import { Input, Textarea, Select, FormGroup } from "@/components/ui/Form";

export default function ChamadosPage() {
  const { showSuccess, showError } = useToast();
  const [chamados, setChamados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  const [novoChamado, setNovoChamado] = useState({
    titulo: "",
    descricao: "",
    equipamento_id: "",
    prioridade: "media",
  });

  useEffect(() => {
    carregarDados();
  }, []);

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

  async function handleCriarChamado(e) {
    e.preventDefault();
    try {
      await chamadosAPI.create({
        ...novoChamado,
        equipamento_id: Number(novoChamado.equipamento_id),
      });
      showSuccess("Chamado criado com sucesso!");
      setNovoChamado({ titulo: "", descricao: "", equipamento_id: "", prioridade: "media" });
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

      <Card>
        <CardContent>
          {chamados.length === 0 ? (
            <EmptyState
              title="Nenhum chamado"
              description="Você ainda não abriu nenhum chamado"
              action={<Button onClick={() => setModalOpen(true)}>Criar Chamado</Button>}
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
                  {chamados.map((chamado) => (
                    <tr key={chamado.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3">{chamado.titulo}</td>
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
            <Button onClick={handleCriarChamado}>Criar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCriarChamado}>
          <FormGroup label="Título">
            <Input
              value={novoChamado.titulo}
              onChange={(e) => setNovoChamado({ ...novoChamado, titulo: e.target.value })}
              placeholder="Descreva o problema brevemente"
              required
            />
          </FormGroup>
          <FormGroup label="Descrição">
            <Textarea
              value={novoChamado.descricao}
              onChange={(e) => setNovoChamado({ ...novoChamado, descricao: e.target.value })}
              placeholder="Detalhes do problema..."
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
                  {eq.nome} ({eq.categoria})
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
