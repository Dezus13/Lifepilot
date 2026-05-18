"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const currentCaseKey = "lifepilot.currentCase";

const analysisSteps = ["Чтение текста", "Оценка риска", "Подготовка результата"];

export default function CaseAnalyzingPage() {
  const router = useRouter();

  useEffect(() => {
    const currentCase = localStorage.getItem(currentCaseKey);

    if (!currentCase) {
      router.replace("/case/new");
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace("/case/result");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="flow-page analysis-state" aria-live="polite">
      <div className="loader-ring" aria-hidden="true" />
      <div className="flow-heading">
        <h1 className="mobile-title">Анализ</h1>
        <p>Обрабатываем текст локально</p>
      </div>

      <div className="status-card analysis-card">
        <div className="analysis-progress" aria-hidden="true">
          <span />
        </div>
        <ol className="analysis-steps">
          {analysisSteps.map((step) => (
            <li key={step}>
              <span aria-hidden="true" />
              {step}
            </li>
          ))}
        </ol>
        <p>Через пару секунд откроется результат.</p>
      </div>
    </div>
  );
}
