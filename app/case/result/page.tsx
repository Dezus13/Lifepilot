"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createLocalAnalysis,
  normalizeCaseStatus,
  type CaseCategory,
  type CaseStatus,
  type DeadlineStatus,
  type LocalAnalysis,
  type PriorityLevel,
  type RiskLevel
} from "../../../lib/analysis-rules";

const currentCaseKey = "lifepilot.currentCase";

type CurrentCase = {
  id?: string;
  sourceText: string;
  category: CaseCategory;
  riskLevel?: RiskLevel;
  analysis?: LocalAnalysis;
  status: CaseStatus;
  updatedAt: string;
};

const fallbackCategory: CaseCategory = "Другое";

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

const riskFactLabels: Record<RiskLevel, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch"
};

const priorityLabels: Record<PriorityLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

const deadlineStatusLabels: Record<DeadlineStatus, string> = {
  overdue: "overdue",
  urgent: "urgent",
  upcoming: "upcoming",
  normal: "normal",
  unknown: "unknown"
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

const notFoundText = "Nicht gefunden";

function readCurrentCase(): CurrentCase | null {
  const rawCase = localStorage.getItem(currentCaseKey);

  if (!rawCase) {
    return null;
  }

  try {
    const parsedCase = JSON.parse(rawCase) as Partial<CurrentCase>;

    if (!parsedCase.sourceText) {
      return null;
    }

    return {
      id: parsedCase.id,
      sourceText: parsedCase.sourceText,
      category: parsedCase.category ?? fallbackCategory,
      riskLevel: parsedCase.riskLevel,
      analysis: parsedCase.analysis,
      status: normalizeCaseStatus(parsedCase.status, parsedCase.analysis?.status ?? "new"),
      updatedAt: parsedCase.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return null;
  }
}

function getShortPreview(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 140) {
    return cleanText;
  }

  return `${cleanText.slice(0, 140)}...`;
}

function hasCurrentExtractedData(analysis?: LocalAnalysis) {
  return Boolean(
    analysis?.extractedData &&
      "caseNumber" in analysis.extractedData &&
      "contacts" in analysis.extractedData &&
      "deadlines" in analysis.extractedData &&
      "documentImportance" in analysis.extractedData &&
      "actionPlan" in analysis &&
      "prioritySummary" in analysis &&
      "priorityLevel" in analysis &&
      "deadlineStatus" in analysis &&
      "daysRemaining" in analysis &&
      "deadlineMessage" in analysis &&
      "status" in analysis
  );
}

function formatValue(value: string | null | undefined) {
  return value && value.trim() ? value : notFoundText;
}

function formatList(values: string[] | undefined) {
  return values && values.length > 0 ? values.join(", ") : notFoundText;
}

function formatContacts(contacts: LocalAnalysis["extractedData"]["contacts"] | undefined) {
  if (!contacts) {
    return notFoundText;
  }

  const contactParts = [
    ...contacts.emails.map((email) => `E-Mail: ${email}`),
    ...contacts.phones.map((phone) => `Telefon: ${phone}`),
    ...contacts.websites.map((website) => `Webseite: ${website}`)
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
  const [currentCase, setCurrentCase] = useState<CurrentCase | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentCase(readCurrentCase());
    setIsLoaded(true);
  }, []);

  const analysis = useMemo(() => {
    if (!currentCase) {
      return null;
    }

    if (hasCurrentExtractedData(currentCase.analysis)) {
      return currentCase.analysis;
    }

    return createLocalAnalysis(currentCase.sourceText);
  }, [currentCase]);

  const riskLevel = analysis?.riskLevel ?? currentCase?.riskLevel ?? "low";
  const caseStatus = analysis?.status ?? currentCase?.status ?? "new";
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
        ["Organisation", formatValue(analysis.extractedData.organization)],
        ["Dokumenttyp", formatValue(analysis.extractedData.documentImportance ?? analysis.extractedData.documentType)],
        ["Aktenzeichen / Fallnummer", formatValue(analysis.extractedData.caseNumber)],
        [
          "Frist",
          analysis.extractedData.deadlines.length > 0
            ? analysis.extractedData.deadlines.join(", ")
            : formatValue(analysis.extractedData.deadline)
        ],
        ["Betrag", formatValue(analysis.extractedData.amount)],
        ["Kontakte", formatContacts(analysis.extractedData.contacts)],
        ["Folgen", formatList(analysis.extractedData.consequences)],
        ["Risikostufe", riskFactLabels[analysis.riskLevel]]
      ]
    : [];

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <h1 className="mobile-title">Результат</h1>
        <p>Загружаем текст из браузера...</p>
      </div>
    );
  }

  if (!currentCase || !analysis) {
    return (
      <div className="flow-page">
        <div className="flow-heading">
          <h1 className="mobile-title">Результат</h1>
          <p>Пока нет текста для анализа. Начните новый кейс, чтобы пройти сценарий заново.</p>
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
        <h1 className="mobile-title">Результат</h1>
        <p>Анализ сформирован локально по ключевым словам. Проверьте факты перед любыми действиями.</p>
      </div>

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
          <span className={`case-status-badge case-status-badge-${caseStatus}`}>{caseStatus}</span>
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
          <span className="result-meta">priority</span>
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
          <span className="section-label">Что делать сейчас</span>
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
          <span className="section-label">Wichtige Fakten</span>
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
          <span className="result-meta">preview</span>
        </div>
        <p>{getShortPreview(currentCase.sourceText)}</p>
      </section>

      <Link className="button primary-action" href="/case/draft">
        Открыть черновик
      </Link>
    </div>
  );
}
