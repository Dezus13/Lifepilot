import type { CaseCategory, CaseStatus, LocalAnalysis, RiskLevel } from "./analysis-rules";

export type StoredCase = {
  id: string;
  sourceText: string;
  category?: CaseCategory;
  riskLevel?: RiskLevel;
  analysis?: Partial<LocalAnalysis>;
  status?: CaseStatus | string;
  createdAt?: string;
  updatedAt?: string;
};
