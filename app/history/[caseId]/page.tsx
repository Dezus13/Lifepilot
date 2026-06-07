"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createLocalAnalysis,
  isCompleteLocalAnalysis,
  normalizeCaseStatus,
  type CaseStatus,
  type PriorityLevel,
  type RiskLevel
} from "../../../lib/analysis-rules";
import { readCaseHistory } from "../../../lib/case-storage";
import type { StoredCase } from "../../../lib/types";

const notFoundText = "Не найдено";

const caseStatusLabels: Record<CaseStatus, string> = {
  new: "Новый",
  analyzed: "Проанализирован",
  "action-required": "Требует действия",
  waiting: "Ожидание",
  completed: "Завершен"
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

const priorityLabels: Record<PriorityLevel, string> = {
  critical: "Критический",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий"
};

function getCasePreview(sourceText: string, maxLength = 140) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= maxLength) {
    return cleanText || notFoundText;
  }

  return `${cleanText.slice(0, maxLength)}...`;
}

function formatValue(value: string | null | undefined) {
  return value && value.trim() ? value : notFoundText;
}

function formatList(values: string[] | undefined) {
  return values && values.length > 0 ? values.join(", ") : notFoundText;
}

export default function HistoryCasePage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const [historyCase, setHistoryCase] = useState<StoredCase | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCase = readCaseHistory().find((caseItem) => caseItem.id === caseId) ?? null;

    setHistoryCase(savedCase);
    setIsLoaded(true);
  }, [caseId]);

  const analysis = useMemo(() => {
    if (!historyCase) {
      return null;
    }

    if (isCompleteLocalAnalysis(historyCase.analysis)) {
      return historyCase.analysis;
    }

    return createLocalAnalysis(historyCase.sourceText);
  }, [historyCase]);

  const caseStatus = normalizeCaseStatus(analysis?.status ?? historyCase?.status, "new");
  const riskLevel = analysis?.riskLevel ?? historyCase?.riskLevel ?? "low";
  const extractedData = analysis?.extractedData;
  const deadlineSummary = extractedData?.deadlines?.[0] ?? extractedData?.deadline ?? analysis?.deadlineMessage;
  const detailFacts = [
    ["Срок", formatValue(deadlineSummary)],
    ["Организация", formatValue(extractedData?.organization)],
    ["Тип документа", formatValue(extractedData?.documentImportance ?? extractedData?.documentType)],
    ["Что нужно сделать", formatValue(extractedData?.requiredAction)],
    ["Возможные последствия", formatList(extractedData?.consequences)]
  ];
  const actionPlan = analysis?.actionPlan?.length ? analysis.actionPlan : analysis?.recommendedActions ?? [];
  const foundKeywords = analysis?.foundKeywords ?? [];

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <section className="result-card empty-state-card">
          <div className="result-card-header">
            <span className="section-label">Кейс</span>
            <span className="result-meta">загрузка</span>
          </div>
          <p>Загружаем сохраненный кейс из браузера...</p>
        </section>
      </div>
    );
  }

  if (!historyCase) {
    return (
      <div className="flow-page">
        <section className="result-card empty-state-card">
          <div className="result-card-header">
            <span className="section-label">Кейс</span>
            <span className="result-meta">не найден</span>
          </div>
          <h1 className="mobile-title">Кейс не найден</h1>
          <p>Сохраненный кейс не найден в локальной истории. Возможно, история была очищена в браузере.</p>
          <Link className="button primary-action" href="/history">
            Назад в историю
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">Сохраненный кейс</h1>
        <p>{getCasePreview(historyCase.sourceText, 180)}</p>
      </div>

      <section className={`result-card summary-card summary-card-${riskLevel}`}>
        <div className="result-card-header">
          <span className="section-label">Краткий обзор</span>
          <span className="result-meta">сохранено</span>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Риск</span>
            <strong className={`risk-badge risk-badge-${riskLevel}`}>{riskLabels[riskLevel]}</strong>
          </div>
          <div className="summary-item">
            <span>Приоритет</span>
            <strong>{analysis ? priorityLabels[analysis.priorityLevel] : notFoundText}</strong>
          </div>
          <div className="summary-item">
            <span>Статус</span>
            <strong>{caseStatusLabels[caseStatus]}</strong>
          </div>
          <div className="summary-item">
            <span>Срок</span>
            <strong>{formatValue(deadlineSummary)}</strong>
          </div>
        </div>
        <p className="summary-note">{formatValue(analysis?.prioritySummary)}</p>
      </section>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Краткое объяснение</span>
          <span className="result-meta">из истории</span>
        </div>
        <span className="category-chip">Категория: {analysis?.category ?? historyCase.category ?? notFoundText}</span>
        <p>{formatValue(analysis?.explanation)}</p>
      </section>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Детали кейса</span>
          <span className="result-meta">факты</span>
        </div>
        <dl className="facts-list">
          {detailFacts.map(([label, value]) => (
            <div className="facts-row" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="result-card recommendations-card">
        <div className="result-card-header">
          <span className="section-label">План действий</span>
          <span className="result-meta">локально</span>
        </div>
        {actionPlan.length > 0 ? (
          <ol className="clean-list">
            {actionPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : (
          <p>{notFoundText}</p>
        )}
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Найденные ключевые слова</span>
          <span className="result-meta">локально</span>
        </div>
        {foundKeywords.length > 0 ? (
          <div className="history-card-badges">
            {foundKeywords.map((keyword) => (
              <span className="category-chip" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p>{notFoundText}</p>
        )}
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Исходный текст</span>
          <span className="result-meta">фрагмент</span>
        </div>
        <p>{getCasePreview(historyCase.sourceText, 320)}</p>
      </section>

      <Link className="button button-secondary primary-action" href="/history">
        Назад в историю
      </Link>
    </div>
  );
}
