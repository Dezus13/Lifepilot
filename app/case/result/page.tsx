"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const currentCaseKey = "lifepilot.currentCase";

type CurrentCase = {
  sourceText: string;
  status: string;
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
      status: parsedCase.status ?? "проанализирован",
      updatedAt: parsedCase.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return null;
  }
}

function getRiskLevel(sourceText: string) {
  const normalizedText = sourceText.toLowerCase();
  const hasRiskWord = riskWords.some((word) => normalizedText.includes(word));

  return hasRiskWord ? "Повышенный" : "Средний";
}

function getShortAnalysis(sourceText: string) {
  const cleanText = sourceText.replace(/\s+/g, " ").trim();

  if (cleanText.length <= 140) {
    return `Текст похож на запрос или короткое письмо: "${cleanText}"`;
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
      return "";
    }

    return getRiskLevel(currentCase.sourceText);
  }, [currentCase]);

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <h1 className="mobile-title">Результат</h1>
        <p>Загружаем сохраненный текст...</p>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="flow-page">
        <div className="flow-heading">
          <h1 className="mobile-title">Результат</h1>
          <p>Пока нет текста для анализа. Создайте новый кейс, чтобы пройти flow заново.</p>
        </div>
        <Link className="button primary-action" href="/case/new">
          Создать кейс
        </Link>
      </div>
    );
  }

  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">Результат</h1>
        <p>Демо-результат сформирован локально. Проверьте факты перед любыми действиями.</p>
      </div>

      <section className="result-card result-card-hero">
        <span className="section-label">Краткий анализ</span>
        <p>{getShortAnalysis(currentCase.sourceText)}</p>
      </section>

      <section className={riskLevel === "Повышенный" ? "result-card warning-card" : "result-card"}>
        <span className="section-label">Уровень риска</span>
        <p className="risk-value">{riskLevel}</p>
      </section>

      <section className="result-card recommendations-card">
        <span className="section-label">Рекомендации</span>
        <ul className="clean-list">
          <li>Проверьте имена, даты, суммы и сроки в исходном тексте.</li>
          <li>Не отправляйте ответ автоматически, если есть угроза штрафа, долга или расторжения договора.</li>
          <li>Для официального письма используйте немецкий черновик как основу и адаптируйте детали.</li>
        </ul>
      </section>

      <Link className="button primary-action" href="/case/draft">
        Открыть черновик
      </Link>
    </div>
  );
}
