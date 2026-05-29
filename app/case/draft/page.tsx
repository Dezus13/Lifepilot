"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type CaseCategory, type RiskLevel } from "../../../lib/analysis-rules";
import { readCurrentCase } from "../../../lib/case-storage";
import type { StoredCase } from "../../../lib/types";

const fallbackCategory: CaseCategory = "Другое";

const draftIntroByRisk: Record<RiskLevel, string> = {
  low: "Ich habe Ihr Schreiben erhalten und möchte die genannten Punkte kurz bestätigen.",
  medium: "Ich habe Ihr Schreiben erhalten und möchte die genannten Punkte sorgfältig prüfen.",
  high: "Ich habe Ihr Schreiben erhalten. Da es um wichtige mögliche Folgen geht, möchte ich die Angelegenheit zunächst sorgfältig prüfen."
};

export default function CaseDraftPage() {
  const [currentCase, setCurrentCase] = useState<StoredCase | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentCase(readCurrentCase());
    setIsLoaded(true);
  }, []);

  const riskLevel = currentCase?.analysis?.riskLevel ?? currentCase?.riskLevel ?? "medium";
  const category = currentCase?.analysis?.category ?? currentCase?.category ?? fallbackCategory;
  const draftText = useMemo(
    () => [
      "Sehr geehrte Damen und Herren,",
      draftIntroByRisk[riskLevel],
      "Bitte senden Sie mir, falls möglich, weitere Informationen zu Fristen, Beträgen und den nächsten erforderlichen Schritten.",
      "Ich werde die Unterlagen prüfen und mich anschließend erneut bei Ihnen melden.",
      "Mit freundlichen Grüßen",
      "[Ihr Name]"
    ],
    [riskLevel]
  );

  if (!isLoaded) {
    return (
      <div className="flow-page">
        <h1 className="mobile-title">Черновик</h1>
        <p>Загружаем текущий кейс...</p>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="flow-page">
        <div className="flow-heading">
          <h1 className="mobile-title">Черновик</h1>
          <p>Пока нет кейса для черновика. Сначала создайте новый кейс и откройте результат.</p>
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
        <h1 className="mobile-title">Черновик</h1>
        <p>Черновик подготовлен для категории {category}. Его нужно проверить и адаптировать вручную.</p>
      </div>

      <section className="result-card draft-card">
        <div className="draft-card-header">
          <span className="section-label">Ответ на немецком</span>
          <span className="draft-tone">нейтральный тон</span>
        </div>
        {draftText.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <p className="inline-warning">
        Это локальный черновик, а не юридическая консультация. Перед отправкой замените плейсхолдеры и проверьте смысл.
      </p>

      <Link className="button button-secondary primary-action" href="/case/result">
        Вернуться к результату
      </Link>
    </div>
  );
}
