"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createLocalAnalysis } from "../../../lib/analysis-rules";
import { saveCase } from "../../../lib/case-storage";
import type { StoredCase } from "../../../lib/types";

function createCaseId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
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

    const analysis = createLocalAnalysis(sourceText);
    const now = new Date().toISOString();
    const caseData: StoredCase = {
      id: createCaseId(),
      sourceText,
      category: analysis.category,
      riskLevel: analysis.riskLevel,
      analysis,
      status: analysis.status,
      createdAt: now,
      updatedAt: now
    };

    const isSaved = saveCase(caseData);

    if (!isSaved) {
      setWarning("Не удалось сохранить кейс в браузере. Проверьте доступное место или настройки браузера.");
      return;
    }

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

        <p className="case-storage-note">
          Категория, риск и ключевые слова определятся локально после нажатия кнопки.
        </p>

        <button className="button primary-action" type="submit">
          Анализировать
        </button>
      </form>
    </div>
  );
}
