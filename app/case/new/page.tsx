"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const currentCaseKey = "lifepilot.currentCase";
const caseHistoryKey = "lifepilot.caseHistory";
const maxHistoryItems = 10;

type RiskLevel = "low" | "medium" | "high";

type StoredCase = {
  id: string;
  sourceText: string;
  riskLevel: RiskLevel;
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

function saveCaseToHistory(caseData: StoredCase) {
  const nextHistory = [
    caseData,
    ...readCaseHistory().filter((historyCase) => historyCase.id !== caseData.id)
  ].slice(0, maxHistoryItems);

  localStorage.setItem(caseHistoryKey, JSON.stringify(nextHistory));
}

export default function NewCasePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [warning, setWarning] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sourceText = text.trim();

    if (!sourceText) {
      setWarning("Вставьте текст письма, документа или ситуации, чтобы начать анализ.");
      return;
    }

    const caseData = {
      id: `${Date.now()}`,
      sourceText,
      riskLevel: getRiskLevel(sourceText),
      status: "создан",
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(currentCaseKey, JSON.stringify(caseData));
    saveCaseToHistory(caseData);

    router.push("/case/analyzing");
  }

  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">Новый кейс</h1>
        <p>Вставьте текст письма, документа или кратко опишите ситуацию. Сейчас данные сохраняются только в браузере.</p>
      </div>

      <form className="case-form" onSubmit={handleSubmit}>
        <div className="case-input-group">
          <label className="field-label" htmlFor="case-text">
            Текст для анализа
          </label>
          <p className="field-hint">
            Лучше вставить полный фрагмент с датами, суммами и требованиями. Личные данные можно заменить вручную.
          </p>
          <textarea
            className="case-textarea"
            id="case-text"
            name="case-text"
            onChange={(event) => {
              setText(event.target.value);
              if (warning) {
                setWarning("");
              }
            }}
            placeholder="Например: письмо от арендодателя, банка, страховой или ведомства. Можно вставить немецкий текст или описать ситуацию по-русски."
            rows={10}
            value={text}
          />
        </div>

        {warning ? <p className="inline-warning">{warning}</p> : null}

        <p className="case-storage-note">Текст сохранится локально только после нажатия кнопки.</p>

        <button className="button primary-action" type="submit">
          Анализировать
        </button>
      </form>
    </div>
  );
}
