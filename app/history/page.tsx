"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const currentCaseKey = "lifepilot.currentCase";
const caseHistoryKey = "lifepilot.caseHistory";

type RiskLevel = "low" | "medium" | "high";
type CaseCategory = "Жильё" | "Банк" | "Страховка" | "Госорган" | "Работа" | "Другое";

type StoredCase = {
  id: string;
  sourceText: string;
  category?: CaseCategory;
  riskLevel?: RiskLevel;
  status?: string;
  updatedAt: string;
};

const fallbackCategory: CaseCategory = "Другое";

const highRiskWords = [
  "kündigung",
  "gericht",
  "inkasso",
  "schulden",
  "высел",
  "суд",
  "штраф",
  "долг",
  "расторж",
  "отказ",
  "блокиров"
];

const mediumRiskWords = [
  "frist",
  "mahnung",
  "zahlung",
  "betrag",
  "unterlagen",
  "versicherung",
  "bank",
  "vermieter",
  "behörde",
  "срок",
  "сумм",
  "оплат",
  "документ",
  "страх",
  "банк",
  "аренд",
  "ведом"
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

function getRiskLevel(sourceText: string): RiskLevel {
  const normalizedText = sourceText.toLowerCase();

  if (highRiskWords.some((word) => normalizedText.includes(word))) {
    return "high";
  }

  if (mediumRiskWords.some((word) => normalizedText.includes(word))) {
    return "medium";
  }

  return "low";
}

function getCaseTitle(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 46) {
    return cleanText;
  }

  return `${cleanText.slice(0, 46)}...`;
}

function getCasePreview(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 110) {
    return cleanText;
  }

  return `${cleanText.slice(0, 110)}...`;
}

function formatDate(value: string) {
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

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<StoredCase[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHistory(readCaseHistory());
    setIsLoaded(true);
  }, []);

  function openResult(historyCase: StoredCase) {
    localStorage.setItem(
      currentCaseKey,
      JSON.stringify({
        sourceText: historyCase.sourceText,
        category: historyCase.category ?? fallbackCategory,
        riskLevel: historyCase.riskLevel ?? getRiskLevel(historyCase.sourceText),
        status: historyCase.status ?? "создан",
        updatedAt: historyCase.updatedAt
      })
    );

    router.push("/case/result");
  }

  function clearHistory() {
    localStorage.removeItem(caseHistoryKey);
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
        <p>Последние кейсы хранятся локально в браузере. Показываем до 10 записей.</p>
      </div>

      <div className="history-list">
        {history.map((historyCase) => {
          const riskLevel = historyCase.riskLevel ?? getRiskLevel(historyCase.sourceText);
          const category = historyCase.category ?? fallbackCategory;

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
                </div>
                <button className="button button-compact" type="button" onClick={() => openResult(historyCase)}>
                  Открыть результат
                </button>
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
