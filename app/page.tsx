"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type CaseCategory, type RiskLevel } from "../lib/analysis-rules";

const caseHistoryKey = "lifepilot.caseHistory";

type StoredCase = {
  id: string;
  sourceText: string;
  category?: CaseCategory;
  riskLevel?: RiskLevel;
  updatedAt: string;
};

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
  },
  {
    href: "/settings/safety",
    label: "Безопасность",
    description: "Проверить правила проекта",
    icon: "◆"
  }
];

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
};

function readCaseHistory() {
  const rawHistory = localStorage.getItem(caseHistoryKey);

  if (!rawHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(rawHistory) as StoredCase[];

    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
}

function getCasePreview(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 58) {
    return cleanText;
  }

  return `${cleanText.slice(0, 58)}...`;
}

function countHighRiskCases(history: StoredCase[]) {
  return history.filter((historyCase) => historyCase.riskLevel === "high").length;
}

export default function HomePage() {
  const [history, setHistory] = useState<StoredCase[]>([]);
  const recentCases = history.slice(0, 3);
  const highRiskCount = countHighRiskCases(history);

  useEffect(() => {
    setHistory(readCaseHistory());
  }, []);

  return (
    <div className="home-dashboard">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span className="home-eyebrow">MVP · данные в браузере</span>
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
          <span>Кейсы</span>
          <strong>{history.length}</strong>
          <small>локально</small>
        </div>
        <div className="overview-tile overview-tile-warning">
          <span>Риск</span>
          <strong>{highRiskCount}</strong>
          <small>высокий</small>
        </div>
        <div className="overview-tile">
          <span>Хранение</span>
          <strong>Local</strong>
          <small>localStorage</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Быстрые действия</h2>
          <p>Основные шаги текущего MVP.</p>
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
          <h2>Последние кейсы</h2>
          <p>Сохраненные локально результаты анализа.</p>
        </div>

        {recentCases.length === 0 ? (
          <div className="placeholder-panel">
            <p>Пока нет сохраненных кейсов. Начните с нового письма или документа.</p>
            <Link className="button primary-action" href="/case/new">
              Новый кейс
            </Link>
          </div>
        ) : (
          <div className="home-case-list">
            {recentCases.map((historyCase) => (
              <article className="home-case-card" key={historyCase.id}>
                <div>
                  <h3>{getCasePreview(historyCase.sourceText)}</h3>
                  <p>{historyCase.category ?? "Другое"}</p>
                </div>
                <span className={`risk-badge risk-badge-${historyCase.riskLevel ?? "low"}`}>
                  {riskLabels[historyCase.riskLevel ?? "low"]}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
