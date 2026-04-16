"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { equipamentosAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";
import { Button, Input, Select, Textarea, FormGroup } from "@/components/ui/Form";
import { ModalWithFooter } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

export default function EquipamentosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novoEquipamento, setNovoEquipamento] = useState({
    nome: "",
    categoria: "",
    patrimonio: "",
    status: "operacional",
    descricao: "",
  });

  // Proteger rota - apenas admin
  useEffect(() => {
    if (user && user.nivel_acesso !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    carregarEquipamentos();
  }, []);

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

  async function handleCriarEquipamento(e) {
    e.preventDefault();
    try {
      await equipamentosAPI.create(novoEquipamento);
      showSuccess("Equipamento criado com sucesso!");
      setNovoEquipamento({
        nome: "",
        categoria: "",
        patrimonio: "",
        status: "operacional",
        descricao: "",
      });
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

      <Card>
        <CardContent>
          {equipamentos.length === 0 ? (
            <EmptyState
              title="Nenhum equipamento"
              description="Comece criando um novo equipamento"
              action={<Button onClick={() => setModalOpen(true)}>Criar Equipamento</Button>}
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
                  {equipamentos.map((equip) => (
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
            <Button onClick={handleCriarEquipamento}>Criar</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCriarEquipamento}>
          <FormGroup label="Nome">
            <Input
              value={novoEquipamento.nome}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, nome: e.target.value })}
              placeholder="Ex: Notebook Dell Latitude"
              required
            />
          </FormGroup>
          <FormGroup label="Categoria">
            <Input
              value={novoEquipamento.categoria}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, categoria: e.target.value })}
              placeholder="Ex: Notebook, Projetor, Impressora"
              required
            />
          </FormGroup>
          <FormGroup label="Patrimônio">
            <Input
              value={novoEquipamento.patrimonio}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, patrimonio: e.target.value })}
              placeholder="Ex: PAT-001234"
              required
            />
          </FormGroup>
          <FormGroup label="Status">
            <Select
              value={novoEquipamento.status}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, status: e.target.value })}
            >
              <option value="operacional">Operacional</option>
              <option value="em_manutencao">Em Manutenção</option>
              <option value="desativado">Desativado</option>
            </Select>
          </FormGroup>
          <FormGroup label="Descrição">
            <Textarea
              value={novoEquipamento.descricao}
              onChange={(e) => setNovoEquipamento({ ...novoEquipamento, descricao: e.target.value })}
              placeholder="Detalhes do equipamento..."
            />
          </FormGroup>
        </form>
      </ModalWithFooter>
    </div>
  );
}
