import { z } from "zod";

// Schemas de validação para formulários

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  nivel_acesso: z.enum(["cliente", "admin", "tecnico"]),
});

export const usuarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  nivel_acesso: z.enum(["cliente", "admin", "tecnico"]),
});

export const chamadoSchema = z.object({
  titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  equipamento_id: z.coerce.number().min(1, "Selecione um equipamento"),
  prioridade: z.enum(["baixa", "media", "alta"]),
});

export const equipamentoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  categoria: z.string().min(3, "Categoria deve ter pelo menos 3 caracteres"),
  patrimonio: z.string().min(3, "Patrimônio deve ter pelo menos 3 caracteres"),
  status: z.enum(["operacional", "em_manutencao", "desativado"]),
  descricao: z.string().optional(),
});

export const manutencaoSchema = z.object({
  chamado_id: z.coerce.number().min(1, "Selecione um chamado"),
  equipamento_id: z.coerce.number().min(1, "Selecione um equipamento"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

export const filtrosChamadosSchema = z.object({
  busca: z.string().optional(),
  status: z.string().optional(),
  prioridade: z.string().optional(),
});

export const filtrosEquipamentosSchema = z.object({
  busca: z.string().optional(),
  status: z.string().optional(),
  categoria: z.string().optional(),
});
