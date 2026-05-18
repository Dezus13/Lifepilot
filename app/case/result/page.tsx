"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const currentCaseKey = "lifepilot.currentCase";

type RiskLevel = "low" | "medium" | "high";

type CurrentCase = {
  sourceText: string;
  riskLevel?: RiskLevel;
  status: string;
  updatedAt: string;
};

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

const riskContent: Record<
  RiskLevel,
  {
    label: string;
    explanation: string;
    recommendations: string[];
  }
> = {
  low: {
    label: "Низкий",
    explanation: "В тексте нет явных признаков срочных санкций, долга или серьезного спора.",
    recommendations: ["Проверьте имена, даты и смысл письма.", "Сохраните текст, если он может понадобиться позже."]
  },
  medium: {
    label: "Средний",
    explanation: "В тексте есть срок, сумма, запрос документов или формальное требование.",
    recommendations: [
      "Проверьте сроки, суммы и список требуемых документов.",
      "Подготовьте ответ только после ручной проверки деталей."
    ]
  },
  high: {
    label: "Высокий",
    explanation: "В тексте есть признаки штрафа, долга, расторжения, отказа или другого серьезного последствия.",
    recommendations: [
      "Не отправляйте черновик автоматически.",
      "Проверьте документы и сроки особенно внимательно.",
      "При сомнении обратитесь к специалисту."
    ]
  }
};

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
      sourceText: parsedCase.sourceText,
      riskLevel: parsedCase.riskLevel,
      status: parsedCase.status ?? "проанализирован",
      updatedAt: parsedCase.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return null;
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

function getShortAnalysis(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 140) {
    return `Текст выглядит как короткое письмо или описание ситуации: "${cleanText}"`;
  }

  return `${cleanText.slice(0, 140)}...`;
}

export default function CaseResultPage() {
  const [currentCase, setCurrentCase] = useState<CurrentCase | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentCase(readCurrentCase());
    setIsLoaded(true);
  }, []);

  const riskLevel = useMemo(() => {
    if (!currentCase) {
      return "low";
    }

    return currentCase.riskLevel ?? getRiskLevel(currentCase.sourceText);
  }, [currentCase]);

  const riskInfo = riskContent[riskLevel];

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <h1 className="mobile-title">Результат</h1>
        <p>Загружаем текст из браузера...</p>
      </div>
    );
  }

  if (!currentCase) {
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
        <p>Результат сформирован локально. Проверьте факты перед любыми действиями.</p>
      </div>

      <section className="result-card result-card-hero">
        <div className="result-card-header">
          <span className="section-label">Краткий анализ</span>
          <span className="result-meta">локально</span>
        </div>
        <p>{getShortAnalysis(currentCase.sourceText)}</p>
      </section>

      <section className={`result-card risk-card risk-card-${riskLevel}`}>
        <div className="result-card-header">
          <span className="section-label">Уровень риска</span>
          <span className="result-meta">проверить</span>
        </div>
        <p className={`risk-badge risk-badge-${riskLevel}`}>{riskInfo.label}</p>
        <p>{riskInfo.explanation}</p>
      </section>

      <section className="result-card recommendations-card">
        <div className="result-card-header">
          <span className="section-label">Рекомендации</span>
          <span className="result-meta">следующие шаги</span>
        </div>
        <ul className="clean-list">
          {riskInfo.recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </section>

      <Link className="button primary-action" href="/case/draft">
        Открыть черновик
      </Link>
    </div>
  );
}
