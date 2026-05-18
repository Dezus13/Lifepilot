import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">Знакомство</h1>
      <p>LifePilot помогает понять письма и документы, но не заменяет юриста и не отправляет ответы автоматически.</p>
      <Link className="button primary-action" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
