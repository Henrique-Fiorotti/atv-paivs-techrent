"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { dashboardAPI, chamadosAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, StatsCard, PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardAdmin() {
  const { showError } = useToast();
  const [resumo, setResumo] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [dashRes, chamRes] = await Promise.all([
        dashboardAPI.getAdmin(),
        chamadosAPI.getAll(),
      ]);
      setResumo(dashRes);
      setChamados(chamRes);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-zinc-600">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Visão geral do sistema de chamados e equipamentos"
      />

      {/* Stats */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resumo.chamados_por_status && (
            <>
              <StatsCard
                title="Abertos"
                value={resumo.chamados_por_status.aberto || 0}
              />
              <StatsCard
                title="Em Atendimento"
                value={resumo.chamados_por_status.em_atendimento || 0}
              />
              <StatsCard
                title="Resolvidos"
                value={resumo.chamados_por_status.resolvido || 0}
              />
              <StatsCard
                title="Cancelados"
                value={resumo.chamados_por_status.cancelado || 0}
              />
            </>
          )}
        </div>
      )}

      {/* Equipamentos */}
      {resumo && resumo.equipamentos_por_status && (
        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Operacionais</p>
                <p className="text-2xl font-bold text-green-700">
                  {resumo.equipamentos_por_status.operacional || 0}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-600 font-medium">Em Manutenção</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {resumo.equipamentos_por_status.em_manutencao || 0}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Desativados</p>
                <p className="text-2xl font-bold text-red-700">
                  {resumo.equipamentos_por_status.desativado || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Chamados */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left px-4 py-3 font-semibold">ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Título</th>
                  <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold">Equipamento</th>
                  <th className="text-left px-4 py-3 font-semibold">Prioridade</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Técnico</th>
                </tr>
              </thead>
              <tbody>
                {chamados.map((chamado) => (
                  <tr key={chamado.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="px-4 py-3">#{chamado.id}</td>
                    <td className="px-4 py-3 font-medium">{chamado.titulo}</td>
                    <td className="px-4 py-3">{chamado.solicitante}</td>
                    <td className="px-4 py-3">{chamado.equipamento}</td>
                    <td className="px-4 py-3">
                      <Badge status={chamado.prioridade}>{chamado.prioridade}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={chamado.status}>{chamado.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {chamado.tecnico_responsavel || "Não atribuído"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
