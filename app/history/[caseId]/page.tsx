"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  normalizeCaseStatus,
  type CaseStatus
} from "../../../lib/analysis-rules";
import { readCaseHistory } from "../../../lib/case-storage";
import type { StoredCase } from "../../../lib/types";

const notFoundText = "Nicht gefunden";

const caseStatusLabels: Record<CaseStatus, string> = {
  new: "Новый",
  analyzed: "Проанализирован",
  "action-required": "Требует действия",
  waiting: "Ожидание",
  completed: "Завершен"
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

  const caseStatus = useMemo(() => {
    return normalizeCaseStatus(historyCase?.status, historyCase?.analysis?.status ?? "new");
  }, [historyCase]);

  const analysis = historyCase?.analysis;
  const extractedData = analysis?.extractedData;
  const detailFacts = [
    ["Статус кейса", caseStatusLabels[caseStatus]],
    ["Priority level", formatValue(analysis?.priorityLevel)],
    ["Deadline", formatValue(analysis?.deadlineMessage)],
    ["Organization", formatValue(extractedData?.organization)],
    ["Document type", formatValue(extractedData?.documentImportance ?? extractedData?.documentType)],
    ["Required action", formatValue(extractedData?.requiredAction)],
    ["Consequences", formatList(extractedData?.consequences)]
  ];
  const actionPlan = analysis?.actionPlan ?? [];
  const foundKeywords = analysis?.foundKeywords ?? [];

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <h1 className="mobile-title">Кейс</h1>
        <p>Загружаем сохраненный кейс из браузера...</p>
      </div>
    );
  }

  if (!historyCase) {
    return (
      <div className="flow-page">
        <div className="flow-heading">
          <h1 className="mobile-title">Кейс не найден</h1>
          <p>Сохраненный кейс не найден в локальной истории. Возможно, история была очищена в браузере.</p>
        </div>
        <Link className="button primary-action" href="/history">
          Назад в историю
        </Link>
      </div>
    );
  }

  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">Сохраненный кейс</h1>
        <p>{getCasePreview(historyCase.sourceText, 180)}</p>
      </div>

      <section className={`result-card case-status-card case-status-card-${caseStatus}`}>
        <div className="result-card-header">
          <span className="section-label">Статус кейса</span>
          <span className={`case-status-badge case-status-badge-${caseStatus}`}>{caseStatus}</span>
        </div>
        <p className="case-status-title">{caseStatusLabels[caseStatus]}</p>
      </section>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Самое важное</span>
          <span className="result-meta">history</span>
        </div>
        <p>{formatValue(analysis?.prioritySummary)}</p>
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
          <span className="result-meta">preview</span>
        </div>
        <p>{getCasePreview(historyCase.sourceText, 320)}</p>
      </section>

      <Link className="button button-secondary primary-action" href="/history">
        Назад в историю
      </Link>
    </div>
  );
}
