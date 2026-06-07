"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createLocalAnalysis,
  isCompleteLocalAnalysis,
  normalizeCaseStatus,
  type CaseCategory,
  type CaseStatus,
  type DeadlineStatus,
  type PriorityLevel,
  type RiskLevel
} from "../../../lib/analysis-rules";
import { readCurrentCase } from "../../../lib/case-storage";
import type { StoredCase } from "../../../lib/types";

const fallbackCategory: CaseCategory = "Другое";

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

const riskFactLabels: Record<RiskLevel, string> = {
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

const deadlineStatusLabels: Record<DeadlineStatus, string> = {
  overdue: "Просрочен",
  urgent: "Срочно",
  upcoming: "Скоро",
  normal: "Обычный",
  unknown: "Неизвестно"
};

const caseStatusLabels: Record<CaseStatus, string> = {
  new: "Новый",
  analyzed: "Проанализирован",
  "action-required": "Требует действия",
  waiting: "Ожидание",
  completed: "Завершен"
};

const caseStatusDescriptions: Record<CaseStatus, string> = {
  new: "Кейс еще не проходил локальный анализ.",
  analyzed: "Анализ готов, критического сигнала или ближайшего обязательного срока не найдено.",
  "action-required": "Нужно вручную проверить риск, срок или шаги плана перед следующим действием.",
  waiting: "В кейсе есть срок или внешнее ожидание, но высокий риск не обнаружен.",
  completed: "По текущим правилам не найдено дальнейших обязательных шагов."
};

const notFoundText = "Не найдено";

function getShortPreview(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 140) {
    return cleanText;
  }

  return `${cleanText.slice(0, 140)}...`;
}

function formatValue(value: string | null | undefined) {
  return value && value.trim() ? value : notFoundText;
}

function formatList(values: string[] | undefined) {
  return values && values.length > 0 ? values.join(", ") : notFoundText;
}

function formatContacts(contacts: NonNullable<NonNullable<StoredCase["analysis"]>["extractedData"]>["contacts"] | undefined) {
  if (!contacts) {
    return notFoundText;
  }

  const contactParts = [
    ...contacts.emails.map((email) => `Эл. почта: ${email}`),
    ...contacts.phones.map((phone) => `Телефон: ${phone}`),
    ...contacts.websites.map((website) => `Сайт: ${website}`)
  ];

  return contactParts.length > 0 ? contactParts.join(", ") : notFoundText;
}

function getNearestDeadline(deadlines: string[]) {
  const parsedDeadlines = deadlines
    .map((deadline) => {
      const match = deadline.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

      if (!match) {
        return null;
      }

      const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));

      return { date, formatted: deadline };
    })
    .filter((deadline): deadline is { date: Date; formatted: string } => Boolean(deadline));
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const futureDeadlines = parsedDeadlines
    .filter((deadline) => deadline.date.getTime() >= todayStart.getTime())
    .sort((firstDeadline, secondDeadline) => firstDeadline.date.getTime() - secondDeadline.date.getTime());

  return (
    futureDeadlines[0]?.formatted ??
    parsedDeadlines.sort((firstDeadline, secondDeadline) => secondDeadline.date.getTime() - firstDeadline.date.getTime())[0]?.formatted ??
    null
  );
}

export default function CaseResultPage() {
  const [currentCase, setCurrentCase] = useState<StoredCase | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentCase(readCurrentCase());
    setIsLoaded(true);
  }, []);

  const analysis = useMemo(() => {
    if (!currentCase) {
      return null;
    }

    if (isCompleteLocalAnalysis(currentCase.analysis)) {
      return currentCase.analysis;
    }

    return createLocalAnalysis(currentCase.sourceText);
  }, [currentCase]);

  const riskLevel = analysis?.riskLevel ?? currentCase?.riskLevel ?? "low";
  const caseStatus = normalizeCaseStatus(analysis?.status ?? currentCase?.status, "new");
  const actionSteps = analysis?.actionPlan?.length ? analysis.actionPlan : analysis?.recommendedActions ?? [];
  const deadlineDate = analysis ? getNearestDeadline(analysis.extractedData.deadlines) ?? analysis.extractedData.deadline : null;
  const deadlineFacts = analysis
    ? [
        ["Статус", deadlineStatusLabels[analysis.deadlineStatus]],
        ["Дата срока", formatValue(deadlineDate)]
      ]
    : [];
  const priorityFacts = analysis
    ? [
        ["Уровень приоритета", priorityLabels[analysis.priorityLevel]],
        ["Ближайший срок", formatValue(deadlineDate)],
        ["Главное действие", formatValue(analysis.extractedData.requiredAction)],
        ["Главное последствие", formatValue(analysis.extractedData.consequences[0])]
      ]
    : [];
  const importantFacts = analysis
    ? [
        ["Организация", formatValue(analysis.extractedData.organization)],
        ["Тип документа", formatValue(analysis.extractedData.documentImportance ?? analysis.extractedData.documentType)],
        ["Номер дела", formatValue(analysis.extractedData.caseNumber)],
        [
          "Срок",
          analysis.extractedData.deadlines.length > 0
            ? analysis.extractedData.deadlines.join(", ")
            : formatValue(analysis.extractedData.deadline)
        ],
        ["Сумма", formatValue(analysis.extractedData.amount)],
        ["Контакты", formatContacts(analysis.extractedData.contacts)],
        ["Возможные последствия", formatList(analysis.extractedData.consequences)],
        ["Уровень риска", riskFactLabels[analysis.riskLevel]]
      ]
    : [];

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <section className="result-card empty-state-card">
          <div className="result-card-header">
            <span className="section-label">Результат</span>
            <span className="result-meta">загрузка</span>
          </div>
          <p>Загружаем текст из браузера...</p>
        </section>
      </div>
    );
  }

  if (!currentCase || !analysis) {
    return (
      <div className="flow-page">
        <section className="result-card empty-state-card">
          <div className="result-card-header">
            <span className="section-label">Результат</span>
            <span className="result-meta">пусто</span>
          </div>
          <h1 className="mobile-title">Нет активного кейса</h1>
          <p>Начните новый кейс, чтобы получить локальный анализ и план действий.</p>
          <Link className="button primary-action" href="/case/new">
            Новый кейс
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">Результат</h1>
        <p>Анализ сформирован локально по ключевым словам. Проверьте факты перед любыми действиями.</p>
      </div>

      <section className={`result-card summary-card summary-card-${riskLevel}`}>
        <div className="result-card-header">
          <span className="section-label">Краткий обзор</span>
          <span className="result-meta">главное</span>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Риск</span>
            <strong className={`risk-badge risk-badge-${riskLevel}`}>{riskLabels[riskLevel]}</strong>
          </div>
          <div className="summary-item">
            <span>Приоритет</span>
            <strong>{priorityLabels[analysis.priorityLevel]}</strong>
          </div>
          <div className="summary-item">
            <span>Статус</span>
            <strong>{caseStatusLabels[caseStatus]}</strong>
          </div>
          <div className="summary-item">
            <span>Срок</span>
            <strong>{formatValue(deadlineDate)}</strong>
          </div>
        </div>
        <p className="summary-note">{analysis.prioritySummary}</p>
      </section>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Краткое объяснение</span>
          <span className="result-meta">локально</span>
        </div>
        <span className="category-chip">Категория: {analysis.category}</span>
        <p>{analysis.explanation}</p>
      </section>

      <section className={`result-card risk-card risk-card-${riskLevel}`}>
        <div className="result-card-header">
          <span className="section-label">Уровень риска</span>
          <span className="result-meta">проверить</span>
        </div>
        <p className={`risk-badge risk-badge-${riskLevel}`}>{riskLabels[riskLevel]}</p>
        <p>{analysis.riskReason}</p>
      </section>

      <section className={`result-card case-status-card case-status-card-${caseStatus}`}>
        <div className="result-card-header">
          <span className="section-label">Статус кейса</span>
          <span className={`case-status-badge case-status-badge-${caseStatus}`}>{caseStatusLabels[caseStatus]}</span>
        </div>
        <p className="case-status-title">{caseStatusLabels[caseStatus]}</p>
        <p>{caseStatusDescriptions[caseStatus]}</p>
      </section>

      <section className={`result-card risk-card risk-card-${riskLevel}`}>
        <div className="result-card-header">
          <span className="section-label">Почему определен этот риск</span>
          <span className="result-meta">причина</span>
        </div>
        <p>Обнаружены слова:</p>
        {analysis.riskKeywords.length > 0 ? (
          <div className="history-card-badges">
            {analysis.riskKeywords.map((keyword) => (
              <span className="category-chip" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p>не найдено</p>
        )}
        <p>Причина: {analysis.riskReason}</p>
      </section>

      {analysis.extractedData.isDeadlineSoon ? (
        <section className="result-card warning-card">
          <div className="result-card-header">
            <span className="section-label">Предупреждение о сроке</span>
            <span className="result-meta">важно</span>
          </div>
          <p>Срок найден: {formatList(analysis.extractedData.deadlines)}</p>
        </section>
      ) : null}

      <section className={`result-card deadline-card deadline-card-${analysis.deadlineStatus}`}>
        <div className="result-card-header">
          <span className="section-label">Статус срока</span>
          <span className={`deadline-status-badge deadline-status-badge-${analysis.deadlineStatus}`}>
            {deadlineStatusLabels[analysis.deadlineStatus]}
          </span>
        </div>
        <p>{analysis.deadlineMessage}</p>
        <dl className="facts-list">
          {deadlineFacts.map(([label, value]) => (
            <div className="facts-row" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Самое важное</span>
          <span className="result-meta">приоритет</span>
        </div>
        <p>{analysis.prioritySummary}</p>
        <dl className="facts-list">
          {priorityFacts.map(([label, value]) => (
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
          <span className="result-meta">следующие шаги</span>
        </div>
        <ol className="clean-list">
          {actionSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Важные факты</span>
          <span className="result-meta">локально</span>
        </div>
        <dl className="facts-list">
          {importantFacts.map(([label, value]) => (
            <div className="facts-row" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Извлеченные данные</span>
          <span className="result-meta">локально</span>
        </div>
        <ul className="clean-list">
          <li>Категория: {analysis.category}</li>
          <li>Тип документа: {formatValue(analysis.extractedData.documentType)}</li>
          <li>Требуемое действие: {formatValue(analysis.extractedData.requiredAction)}</li>
        </ul>
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Найденные ключевые слова</span>
          <span className="result-meta">локально</span>
        </div>
        {analysis.foundKeywords && analysis.foundKeywords.length > 0 ? (
          <div className="history-card-badges">
            {analysis.foundKeywords.map((keyword) => (
              <span className="category-chip" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p>Ключевые слова из текущих правил не найдены.</p>
        )}
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Исходный текст</span>
          <span className="result-meta">фрагмент</span>
        </div>
        <p>{getShortPreview(currentCase.sourceText)}</p>
      </section>

    </div>
  );
}
