"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const currentCaseKey = "lifepilot.currentCase";

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

    localStorage.setItem(
      currentCaseKey,
      JSON.stringify({
        sourceText,
        status: "создан",
        updatedAt: new Date().toISOString()
      })
    );

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
