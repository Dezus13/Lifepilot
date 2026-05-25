"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getRiskLevel,
  normalizeCaseStatus,
  type CaseCategory,
  type CaseStatus,
  type PriorityLevel,
  type RiskLevel
} from "../../lib/analysis-rules";
import { clearCaseHistory, readCaseHistory, saveCurrentCase } from "../../lib/case-storage";
import type { StoredCase } from "../../lib/types";

const fallbackCategory: CaseCategory = "Другое";
const notFoundText = "Nicht gefunden";

type StatusFilter = "all" | "action-required" | "waiting" | "completed" | "analyzed";
type PriorityFilter = "all" | PriorityLevel;
type SortMode = "newest" | "oldest" | "priority";

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

const statusFilterLabels: Record<StatusFilter, string> = {
  all: "Все",
  "action-required": "Требует действия",
  waiting: "Ожидание",
  completed: "Завершено",
  analyzed: "Проанализировано"
};

const caseStatusLabels: Record<CaseStatus, string> = {
  new: "Новый",
  analyzed: "Проанализировано",
  "action-required": "Требует действия",
  waiting: "Ожидание",
  completed: "Завершено"
};

const priorityLabels: Record<PriorityFilter, string> = {
  all: "Все",
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low"
};

const sortLabels: Record<SortMode, string> = {
  newest: "Новые сначала",
  oldest: "Старые сначала",
  priority: "Critical/high сначала"
};

const priorityRank: Record<PriorityLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

function getCaseTitle(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return notFoundText;
  }

  if (cleanText.length <= 46) {
    return cleanText;
  }

  return `${cleanText.slice(0, 46)}...`;
}

function getCasePreview(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return notFoundText;
  }

  if (cleanText.length <= 110) {
    return cleanText;
  }

  return `${cleanText.slice(0, 110)}...`;
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "Дата не указана";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatValue(value: string | null | undefined) {
  return value && value.trim() ? value : notFoundText;
}

function getCaseStatus(historyCase: StoredCase) {
  return normalizeCaseStatus(historyCase.status, historyCase.analysis?.status ?? "new");
}

function getPriorityLevel(historyCase: StoredCase) {
  return historyCase.analysis?.priorityLevel ?? null;
}

function getSearchText(historyCase: StoredCase) {
  const extractedData = historyCase.analysis?.extractedData;
  const documentType = extractedData?.documentImportance ?? extractedData?.documentType;
  const keywords = historyCase.analysis?.foundKeywords ?? [];

  return [
    getCaseTitle(historyCase.sourceText),
    getCasePreview(historyCase.sourceText),
    extractedData?.organization,
    documentType,
    ...keywords
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getUpdatedAtTime(historyCase: StoredCase) {
  const time = new Date(historyCase.updatedAt ?? historyCase.createdAt ?? "").getTime();

  return Number.isNaN(time) ? 0 : time;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<StoredCase[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  useEffect(() => {
    setHistory(readCaseHistory());
    setIsLoaded(true);
  }, []);

  const visibleHistory = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return history
      .filter((historyCase) => {
        const matchesSearch = !normalizedQuery || getSearchText(historyCase).includes(normalizedQuery);
        const matchesStatus = statusFilter === "all" || getCaseStatus(historyCase) === statusFilter;
        const priorityLevel = getPriorityLevel(historyCase);
        const matchesPriority = priorityFilter === "all" || priorityLevel === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((firstCase, secondCase) => {
        if (sortMode === "oldest") {
          return getUpdatedAtTime(firstCase) - getUpdatedAtTime(secondCase);
        }

        if (sortMode === "priority") {
          const firstPriority = getPriorityLevel(firstCase);
          const secondPriority = getPriorityLevel(secondCase);
          const firstRank = firstPriority ? priorityRank[firstPriority] : Number.POSITIVE_INFINITY;
          const secondRank = secondPriority ? priorityRank[secondPriority] : Number.POSITIVE_INFINITY;

          if (firstRank !== secondRank) {
            return firstRank - secondRank;
          }
        }

        return getUpdatedAtTime(secondCase) - getUpdatedAtTime(firstCase);
      });
  }, [history, priorityFilter, searchQuery, sortMode, statusFilter]);

  function openResult(historyCase: StoredCase) {
    saveCurrentCase({
      id: historyCase.id,
      sourceText: historyCase.sourceText,
      category: historyCase.category ?? fallbackCategory,
      riskLevel: historyCase.riskLevel ?? getRiskLevel(historyCase.sourceText),
      analysis: historyCase.analysis,
      status: normalizeCaseStatus(historyCase.status, historyCase.analysis?.status ?? "new"),
      updatedAt: historyCase.updatedAt ?? new Date().toISOString()
    });

    router.push("/case/result");
  }

  function clearHistory() {
    clearCaseHistory();
    setHistory([]);
  }

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <h1 className="mobile-title">История</h1>
        <p>Загружаем сохраненные кейсы из браузера...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flow-page">
        <div className="flow-heading">
          <h1 className="mobile-title">История</h1>
          <p>Пока нет сохраненных кейсов. Создайте новый кейс, чтобы он появился здесь.</p>
        </div>
        <Link className="button primary-action" href="/case/new">
          Новый кейс
        </Link>
      </div>
    );
  }

  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">История</h1>
        <p>Все сохраненные кейсы хранятся локально в браузере.</p>
      </div>

      <section className="history-controls" aria-label="Фильтры истории">
        <div className="history-search-group">
          <label className="field-label" htmlFor="history-search">
            Поиск
          </label>
          <input
            className="history-search-input"
            id="history-search"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Название, организация, тип документа, ключевые слова"
            type="search"
            value={searchQuery}
          />
        </div>

        <div className="history-filter-grid">
          <label className="history-filter-field">
            <span>Статус</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              {(Object.keys(statusFilterLabels) as StatusFilter[]).map((status) => (
                <option key={status} value={status}>
                  {statusFilterLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="history-filter-field">
            <span>Приоритет</span>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}>
              {(Object.keys(priorityLabels) as PriorityFilter[]).map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>

          <label className="history-filter-field">
            <span>Сортировка</span>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
              {(Object.keys(sortLabels) as SortMode[]).map((sort) => (
                <option key={sort} value={sort}>
                  {sortLabels[sort]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {visibleHistory.length === 0 ? (
        <section className="result-card">
          <div className="result-card-header">
            <span className="section-label">Кейсы не найдены</span>
            <span className="result-meta">filter</span>
          </div>
          <p>Кейсы не найдены</p>
        </section>
      ) : null}

      <div className="history-list">
        {visibleHistory.map((historyCase) => {
          const riskLevel = historyCase.riskLevel ?? getRiskLevel(historyCase.sourceText);
          const category = historyCase.category ?? fallbackCategory;
          const caseStatus = getCaseStatus(historyCase);
          const priorityLevel = getPriorityLevel(historyCase);
          const organization = historyCase.analysis?.extractedData?.organization;
          const documentType =
            historyCase.analysis?.extractedData?.documentImportance ?? historyCase.analysis?.extractedData?.documentType;

          return (
            <article className="history-card" key={historyCase.id}>
              <div className="history-card-header">
                <div>
                  <h2>{getCaseTitle(historyCase.sourceText)}</h2>
                  <p>{getCasePreview(historyCase.sourceText)}</p>
                </div>
                <span className="case-status-chip">{formatDate(historyCase.updatedAt)}</span>
              </div>

              <div className="history-card-footer">
                <div className="history-card-badges">
                  <span className="category-chip">Категория: {category}</span>
                  <span className={`risk-badge risk-badge-${riskLevel}`}>
                    Риск: {riskLabels[riskLevel]}
                  </span>
                  <span className={`case-status-badge case-status-badge-${caseStatus}`}>{caseStatusLabels[caseStatus]}</span>
                  <span className="case-status-chip">Priority: {priorityLevel ?? notFoundText}</span>
                  <span className="case-status-chip">Организация: {formatValue(organization)}</span>
                  <span className="case-status-chip">Тип: {formatValue(documentType)}</span>
                </div>
                <div className="history-card-actions">
                  <Link className="button button-secondary button-compact" href={`/history/${encodeURIComponent(historyCase.id)}`}>
                    Открыть кейс
                  </Link>
                  <button className="button button-compact" type="button" onClick={() => openResult(historyCase)}>
                    Открыть результат
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button className="button button-secondary primary-action" type="button" onClick={clearHistory}>
        Очистить историю
      </button>
    </div>
  );
}
