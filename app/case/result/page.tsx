"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createLocalAnalysis, type CaseCategory, type LocalAnalysis, type RiskLevel } from "../../../lib/analysis-rules";

const currentCaseKey = "lifepilot.currentCase";

type CurrentCase = {
  id?: string;
  sourceText: string;
  category: CaseCategory;
  riskLevel?: RiskLevel;
  analysis?: LocalAnalysis;
  status: string;
  updatedAt: string;
};

const fallbackCategory: CaseCategory = "Другое";

const riskLabels: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий"
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
      id: parsedCase.id,
      sourceText: parsedCase.sourceText,
      category: parsedCase.category ?? fallbackCategory,
      riskLevel: parsedCase.riskLevel,
      analysis: parsedCase.analysis,
      status: parsedCase.status ?? "проанализирован",
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

    if (currentCase.analysis?.extractedData?.requiredAction !== undefined) {
      return currentCase.analysis;
    }

    return createLocalAnalysis(currentCase.sourceText);
  }, [currentCase]);

  const riskLevel = analysis?.riskLevel ?? currentCase?.riskLevel ?? "low";

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
          <p>⚠ Срок найден: {analysis.extractedData.deadline}</p>
        </section>
      ) : null}

      <section className="result-card recommendations-card">
        <div className="result-card-header">
          <span className="section-label">Что делать сейчас</span>
          <span className="result-meta">следующие шаги</span>
        </div>
        <ul className="clean-list">
          {analysis.recommendedActions.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </section>

      <section className="result-card">
        <div className="result-card-header">
          <span className="section-label">Извлеченные данные</span>
          <span className="result-meta">локально</span>
        </div>
        <ul className="clean-list">
          <li>Категория: {analysis.category}</li>
          <li>Тип документа: {analysis.extractedData.documentType ?? "не найден"}</li>
          <li>Организация: {analysis.extractedData.organization ?? "не найдена"}</li>
          <li>Требуемое действие: {analysis.extractedData.requiredAction ?? "не найдено"}</li>
          <li>Срок: {analysis.extractedData.deadline ?? "не найден"}</li>
          <li>Сумма: {analysis.extractedData.amount ?? "не найдена"}</li>
          <li>
            Последствия:{" "}
            {analysis.extractedData.consequences.length > 0
              ? analysis.extractedData.consequences.join(", ")
              : "не найдено"}
          </li>
          <li>Риск: {riskLabels[analysis.riskLevel]}</li>
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
