"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const currentCaseKey = "lifepilot.currentCase";
const caseHistoryKey = "lifepilot.caseHistory";

type StoredCase = {
  id: string;
  sourceText: string;
  status?: string;
  updatedAt: string;
};

const riskWords = [
  "kündigung",
  "frist",
  "mahnung",
  "gericht",
  "inkasso",
  "zahlung",
  "schulden",
  "высел",
  "суд",
  "штраф",
  "долг",
  "срок"
];

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

function getRiskLevel(sourceText: string) {
  const normalizedText = sourceText.toLowerCase();
  const hasRiskWord = riskWords.some((word) => normalizedText.includes(word));

  return hasRiskWord ? "Повышенный" : "Средний";
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
          const riskLevel = getRiskLevel(historyCase.sourceText);

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
                <span className={riskLevel === "Повышенный" ? "history-risk history-risk-warning" : "history-risk"}>
                  Риск: {riskLevel}
                </span>
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
