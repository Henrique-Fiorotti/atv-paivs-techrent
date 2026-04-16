"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { manutencaoAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, PageHeader, EmptyState } from "@/components/ui/Card";

export default function HistoricoPage() {
  const { showError } = useToast();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    try {
      setLoading(true);
      const res = await manutencaoAPI.getAll();
      setHistorico(res);
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
        <p className="text-zinc-600">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de Manutenção"
        description="Registro de todos os reparos realizados"
      />

      <Card>
        <CardContent>
          {historico.length === 0 ? (
            <EmptyState
              title="Nenhum registro"
              description="Nenhuma manutenção foi registrada ainda"
            />
          ) : (
            <div className="space-y-4">
              {historico.map((registro) => (
                <div
                  key={registro.id}
                  className="p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{registro.equipamento}</h3>
                      <p className="text-sm text-zinc-600">Chamado #{registro.chamado_id}</p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {new Date(registro.registrado_em).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded">
                    {registro.descricao}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Técnico: <span className="font-semibold">{registro.tecnico}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
