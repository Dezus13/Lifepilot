export default function CaseDraftPage() {
  return (
    <div className="flow-page">
      <div className="flow-heading">
        <h1 className="mobile-title">Черновик</h1>
        <p>Пример немецкого ответа для проверки и ручной адаптации.</p>
      </div>

      <section className="result-card draft-card">
        <span className="section-label">Beispielantwort</span>
        <p>Sehr geehrte Damen und Herren,</p>
        <p>
          vielen Dank für Ihre Nachricht. Ich habe Ihr Schreiben erhalten und möchte die genannten Punkte
          sorgfältig prüfen. Bitte senden Sie mir, falls möglich, weitere Informationen zu Fristen, Beträgen
          und den nächsten erforderlichen Schritten.
        </p>
        <p>
          Ich werde mich nach der Prüfung der Unterlagen erneut bei Ihnen melden. Bis dahin bitte ich darum,
          keine weiteren Maßnahmen ohne vorherige schriftliche Information einzuleiten.
        </p>
        <p>Mit freundlichen Grüßen</p>
        <p>[Ihr Name]</p>
      </section>

      <p className="inline-warning">
        Это пример черновика, а не юридическая консультация. Перед отправкой замените плейсхолдеры и проверьте смысл.
      </p>
    </div>
  );
}
