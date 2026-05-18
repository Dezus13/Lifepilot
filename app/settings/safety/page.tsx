import Link from "next/link";

export default function SafetySettingsPage() {
  return (
    <div className="placeholder-panel">
      <h1 className="mobile-title">Безопасность</h1>
      <p>LifePilot не является юридической консультацией. Проверяйте факты и не отправляйте черновик без ручной правки.</p>
      <Link className="button primary-action" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
