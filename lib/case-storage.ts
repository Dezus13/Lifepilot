import type { StoredCase } from "./types";

const currentCaseKey = "lifepilot.currentCase";
const caseHistoryKey = "lifepilot.caseHistory";

export function readCaseHistory(): StoredCase[] {
  try {
    const rawHistory = localStorage.getItem(caseHistoryKey);

    if (!rawHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(rawHistory) as StoredCase[];

    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
}

export function readCurrentCase(): StoredCase | null {
  try {
    const rawCase = localStorage.getItem(currentCaseKey);

    if (!rawCase) {
      return null;
    }

    const parsedCase = JSON.parse(rawCase) as Partial<StoredCase>;

    if (!parsedCase.sourceText) {
      return null;
    }

    return {
      id: parsedCase.id ?? "",
      sourceText: parsedCase.sourceText,
      category: parsedCase.category,
      riskLevel: parsedCase.riskLevel,
      analysis: parsedCase.analysis,
      status: parsedCase.status,
      createdAt: parsedCase.createdAt,
      updatedAt: parsedCase.updatedAt
    };
  } catch {
    return null;
  }
}

export function saveCurrentCase(caseData: StoredCase) {
  try {
    localStorage.setItem(currentCaseKey, JSON.stringify(caseData));
    return true;
  } catch {
    return false;
  }
}

export function saveCase(caseData: StoredCase) {
  try {
    const nextHistory = [
      caseData,
      ...readCaseHistory().filter((historyCase) => historyCase.id !== caseData.id)
    ];

    localStorage.setItem(currentCaseKey, JSON.stringify(caseData));
    localStorage.setItem(caseHistoryKey, JSON.stringify(nextHistory));
    return true;
  } catch {
    return false;
  }
}

export function removeCase(caseId: string) {
  try {
    const nextHistory = readCaseHistory().filter((historyCase) => historyCase.id !== caseId);

    localStorage.setItem(caseHistoryKey, JSON.stringify(nextHistory));
    return true;
  } catch {
    return false;
  }
}

export function clearCaseHistory() {
  try {
    localStorage.removeItem(caseHistoryKey);
    return true;
  } catch {
    return false;
  }
}

export function hasCurrentCase() {
  return Boolean(readCurrentCase());
}
