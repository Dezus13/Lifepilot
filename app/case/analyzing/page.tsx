"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const currentCaseKey = "lifepilot.currentCase";

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
        <p>Разбираем текст и готовим краткий результат. Данные не отправляются на внешний сервис.</p>
      </div>
      <div className="status-card">
        <strong>Идет анализ</strong>
        <span>Обычно это занимает пару секунд.</span>
      </div>
    </div>
  );
}
