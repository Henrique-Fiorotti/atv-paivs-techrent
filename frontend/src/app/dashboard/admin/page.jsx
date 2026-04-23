"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { dashboardAPI, chamadosAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, StatsCard, PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, CheckCircle, Clock, Zap, Cpu, Users, TrendingUp } from "lucide-react";

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Administrativo"
        description="Visão geral completa do sistema de chamados e equipamentos"
      />

      {/* Stats Principal */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Chamados Abertos"
            value={resumo.chamados_por_status?.aberto || 0}
            icon={AlertCircle}
            trend="up"
            trendLabel="Aguardando atendimento"
          />
          <StatsCard
            title="Em Atendimento"
            value={resumo.chamados_por_status?.em_atendimento || 0}
            icon={Zap}
            trend="up"
            trendLabel="Técnicos trabalhando"
          />
          <StatsCard
            title="Resolvidos"
            value={resumo.chamados_por_status?.resolvido || 0}
            icon={CheckCircle}
            trend="up"
            trendLabel="Sucesso"
          />
          <StatsCard
            title="Cancelados"
            value={resumo.chamados_por_status?.cancelado || 0}
            icon={AlertCircle}
          />
        </div>
      )}

      {/* Status dos Equipamentos */}
      {resumo && resumo.equipamentos_por_status && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu size={24} className="text-blue-400" />
              Status dos Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-linear-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle size={20} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">Operacionais</p>
                </div>
                <p className="text-3xl font-bold text-emerald-200">
                  {resumo.equipamentos_por_status.operacional || 0}
                </p>
                <p className="text-xs text-emerald-300/60 mt-2">Equipamentos em funcionamento</p>
              </div>

              <div className="p-6 bg-linear-to-br from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Clock size={20} className="text-amber-400" />
                  </div>
                  <p className="text-sm font-semibold text-amber-300">Em Manutenção</p>
                </div>
                <p className="text-3xl font-bold text-amber-200">
                  {resumo.equipamentos_por_status.em_manutencao || 0}
                </p>
                <p className="text-xs text-amber-300/60 mt-2">Aguardando reparo</p>
              </div>

              <div className="p-6 bg-linear-to-br from-red-500/10 to-red-600/10 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <p className="text-sm font-semibold text-red-300">Desativados</p>
                </div>
                <p className="text-3xl font-bold text-red-200">
                  {resumo.equipamentos_por_status.desativado || 0}
                </p>
                <p className="text-xs text-red-300/60 mt-2">Fora de operação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Chamados Recentes */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-400" />
            Todos os Chamados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/50">
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">ID</th>
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">Título</th>
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">Cliente</th>
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">Equipamento</th>
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">Prioridade</th>
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left px-4 py-4 font-semibold text-slate-300">Técnico</th>
                </tr>
              </thead>
              <tbody>
                {chamados.length > 0 ? (
                  chamados.map((chamado) => (
                    <tr key={chamado.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-slate-700/50 rounded-lg text-blue-300 font-mono text-xs">
                          #{chamado.id}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-100">{chamado.titulo}</td>
                      <td className="px-4 py-4 text-slate-300">{chamado.solicitante}</td>
                      <td className="px-4 py-4 text-slate-300">{chamado.equipamento}</td>
                      <td className="px-4 py-4">
                        <Badge status={chamado.prioridade}>{chamado.prioridade}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge status={chamado.status}>{chamado.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {chamado.tecnico_responsavel ? (
                          <span className="text-emerald-300 font-medium">{chamado.tecnico_responsavel}</span>
                        ) : (
                          <span className="text-slate-500 italic">Não atribuído</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                      Nenhum chamado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
