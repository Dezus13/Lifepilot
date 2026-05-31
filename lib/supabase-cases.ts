import {
  isSupabaseConfigured,
  getSupabaseClient,
  type Json,
  type SupabaseCaseRow
} from "./supabase-client";
import type { CaseCategory, CaseStatus, DeadlineStatus, PriorityLevel, RiskLevel } from "./analysis-rules";
import { normalizeCaseStatus } from "./analysis-rules";
import type { StoredCase } from "./types";

const caseCategories: CaseCategory[] = ["Жильё", "Банк", "Страховка", "Госорган", "Работа", "Документы", "Другое"];
const riskLevels: RiskLevel[] = ["low", "medium", "high"];
const priorityLevels: PriorityLevel[] = ["critical", "high", "medium", "low"];
const deadlineStatuses: DeadlineStatus[] = ["overdue", "urgent", "upcoming", "normal", "unknown"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeCaseCategory(value: unknown): CaseCategory | undefined {
  return typeof value === "string" && caseCategories.includes(value as CaseCategory)
    ? (value as CaseCategory)
    : undefined;
}

function normalizeRiskLevel(value: unknown): RiskLevel | undefined {
  return typeof value === "string" && riskLevels.includes(value as RiskLevel) ? (value as RiskLevel) : undefined;
}

function normalizePriorityLevel(value: unknown): PriorityLevel | undefined {
  return typeof value === "string" && priorityLevels.includes(value as PriorityLevel)
    ? (value as PriorityLevel)
    : undefined;
}

function normalizeDeadlineStatus(value: unknown): DeadlineStatus | undefined {
  return typeof value === "string" && deadlineStatuses.includes(value as DeadlineStatus)
    ? (value as DeadlineStatus)
    : undefined;
}

function normalizeActionPlan(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : undefined;
}

function getAnalysisValue(analysis: Record<string, unknown>, key: string) {
  return analysis[key];
}

function mapSupabaseCase(row: SupabaseCaseRow): StoredCase {
  const savedAnalysis = isRecord(row.analysis) ? row.analysis : {};
  const category = normalizeCaseCategory(row.category ?? getAnalysisValue(savedAnalysis, "category"));
  const riskLevel = normalizeRiskLevel(row.risk_level ?? getAnalysisValue(savedAnalysis, "riskLevel"));
  const priorityLevel = normalizePriorityLevel(row.priority_level ?? getAnalysisValue(savedAnalysis, "priorityLevel"));
  const deadlineStatus = normalizeDeadlineStatus(row.deadline_status ?? getAnalysisValue(savedAnalysis, "deadlineStatus"));
  const actionPlan = normalizeActionPlan(row.action_plan ?? getAnalysisValue(savedAnalysis, "actionPlan"));
  const status: CaseStatus = normalizeCaseStatus(row.status ?? getAnalysisValue(savedAnalysis, "status"), "new");

  return {
    id: row.id,
    sourceText: row.source_text,
    category,
    riskLevel,
    status,
    analysis: {
      ...savedAnalysis,
      category,
      riskLevel,
      status,
      priorityLevel,
      deadlineStatus,
      actionPlan
    },
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

export async function readSupabaseCases(): Promise<StoredCase[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("cases")
      .select("id, title, category, source_text, summary, risk_level, priority_level, status, deadline_status, action_plan, analysis, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data ?? []).map(mapSupabaseCase);
  } catch {
    return [];
  }
}
