"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getRiskLevel,
  normalizeCaseStatus,
  type CaseStatus,
  type PriorityLevel,
  type RiskLevel
} from "../lib/analysis-rules";
import { readCaseHistory } from "../lib/case-storage";
import type { StoredCase } from "../lib/types";

const notFoundText = "Не найдено";

const quickActions = [
  {
    href: "/case/new",
    label: "Новый кейс",
    description: "Вставить письмо или документ",
    icon: "+"
  },
  {
    href: "/history",
    label: "История",
    description: "Открыть сохраненные кейсы",
    icon: "↺"
  }
];

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

const caseStatusLabels: Record<CaseStatus, string> = {
  new: "Новый",
  analyzed: "Проанализировано",
  "action-required": "Требует действия",
  waiting: "Ожидание",
  completed: "Завершено"
};

const priorityLabels: Record<PriorityLevel, string> = {
  critical: "Критический",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий"
};

function getCasePreview(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return notFoundText;
  }

  if (cleanText.length <= 58) {
    return cleanText;
  }

  return `${cleanText.slice(0, 58)}...`;
}

function getCaseStatus(historyCase: StoredCase) {
  return normalizeCaseStatus(historyCase.status, historyCase.analysis?.status ?? "new");
}

function getCaseRiskLevel(historyCase: StoredCase) {
  return historyCase.riskLevel ?? historyCase.analysis?.riskLevel ?? getRiskLevel(historyCase.sourceText);
}

function getPriorityLevel(historyCase: StoredCase): PriorityLevel | null {
  return historyCase.analysis?.priorityLevel ?? null;
}

function getCreatedAt(historyCase: StoredCase) {
  return historyCase.createdAt ?? historyCase.updatedAt;
}

function getCaseTime(historyCase: StoredCase) {
  const time = new Date(getCreatedAt(historyCase) ?? "").getTime();

  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value: string | undefined) {
  if (!value) {
    return notFoundText;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return notFoundText;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function countHighRiskCases(history: StoredCase[]) {
  return history.filter((historyCase) => getCaseRiskLevel(historyCase) === "high").length;
}

export default function HomePage() {
  const [history, setHistory] = useState<StoredCase[]>([]);
  const lastCase = [...history].sort((firstCase, secondCase) => getCaseTime(secondCase) - getCaseTime(firstCase))[0] ?? null;
  const lastCasePriority = lastCase ? getPriorityLevel(lastCase) : null;
  const highRiskCount = countHighRiskCases(history);
  const actionRequiredCount = history.filter((historyCase) => getCaseStatus(historyCase) === "action-required").length;
  const waitingCount = history.filter((historyCase) => getCaseStatus(historyCase) === "waiting").length;
  const completedCount = history.filter((historyCase) => getCaseStatus(historyCase) === "completed").length;

  useEffect(() => {
    setHistory(readCaseHistory());
  }, []);

  return (
    <div className="home-dashboard">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Локальная версия · данные в браузере</span>
          <h1 className="mobile-title" id="home-title">
            Понятный старт для писем и документов
          </h1>
          <p>
            LifePilot помогает разобрать текст, увидеть возможный риск и подготовить черновик ответа для ручной проверки.
          </p>
        </div>

        <Link className="button home-primary-action" href="/case/new">
          Новый кейс
        </Link>
      </section>

      <section className="home-overview" aria-label="Обзор статусов">
        <div className="overview-tile">
          <span>Всего кейсов</span>
          <strong>{history.length}</strong>
          <small>локально</small>
        </div>
        <div className="overview-tile overview-tile-warning">
          <span>Требуют действия</span>
          <strong>{actionRequiredCount}</strong>
          <small>по статусу</small>
        </div>
        <div className="overview-tile overview-tile-warning">
          <span>Высокий риск</span>
          <strong>{highRiskCount}</strong>
          <small>по уровню риска</small>
        </div>
        <div className="overview-tile">
          <span>В ожидании</span>
          <strong>{waitingCount}</strong>
          <small>по статусу</small>
        </div>
        <div className="overview-tile">
          <span>Завершено</span>
          <strong>{completedCount}</strong>
          <small>по статусу</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Последний кейс</h2>
          <p>Самая свежая запись из локальной истории.</p>
        </div>

        {!lastCase ? (
          <div className="placeholder-panel">
            <p>История пока пуста</p>
            <Link className="button primary-action" href="/case/new">
              Новый кейс
            </Link>
          </div>
        ) : (
          <article className="home-case-card home-last-case-card">
            <div>
              <h3>{getCasePreview(lastCase.sourceText)}</h3>
              <p>Дата создания: {formatDate(getCreatedAt(lastCase))}</p>
            </div>
            <div className="history-card-badges">
              <span className={`case-status-badge case-status-badge-${getCaseStatus(lastCase)}`}>
                {caseStatusLabels[getCaseStatus(lastCase)]}
              </span>
              <span className="case-status-chip">
                Приоритет: {lastCasePriority ? priorityLabels[lastCasePriority] : notFoundText}
              </span>
            </div>
          </article>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Быстрые действия</h2>
          <p>Основные шаги текущей версии.</p>
        </div>

        <div className="quick-actions">
          {quickActions.map((action) => (
            <Link className="quick-action-card" href={action.href} key={action.href}>
              <span className="quick-action-icon" aria-hidden="true">
                {action.icon}
              </span>
              <span>
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Локальное состояние</h2>
          <p>История хранится только в браузере и не отправляется на сервер.</p>
        </div>

        <div className="home-case-card">
          <span className="risk-badge risk-badge-low">{riskLabels.low}</span>
          <p>Старые записи без новых полей показывают {notFoundText} вместо пустых значений.</p>
        </div>
      </section>
    </div>
  );
}
