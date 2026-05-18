import Link from "next/link";

const links = [
  { href: "/", label: "Главная", description: "Старт и обзор", icon: "home" },
  { href: "/onboarding", label: "Знакомство", description: "Границы продукта", icon: "info" },
  { href: "/case/new", label: "Новый кейс", description: "Вставить текст", icon: "plus", primary: true },
  { href: "/case/analyzing", label: "Анализ", description: "Обработка текста", icon: "scan" },
  { href: "/case/result", label: "Результат", description: "Риск и шаги", icon: "result" },
  { href: "/case/draft", label: "Черновик", description: "Пример ответа", icon: "draft" },
  { href: "/case/high-risk", label: "Риск", description: "Важное предупреждение", icon: "risk" },
  { href: "/history", label: "История", description: "Список кейсов", icon: "history" },
  { href: "/settings/safety", label: "Безопасность", description: "Правила и приватность", icon: "shield" },
  { href: "/error", label: "Ошибка", description: "Безопасный выход", icon: "error" }
];

export function MainNavigation() {
  return (
    <nav className="mobile-navigation" aria-label="Основная навигация">
      <p className="navigation-title">Навигация</p>
      {links.map((link) => (
        <Link
          className={link.primary ? "nav-link nav-link-primary" : "nav-link"}
          href={link.href}
          key={link.href}
        >
          <span className={`nav-icon nav-icon-${link.icon}`} aria-hidden="true" />
          <span className="nav-link-copy">
            <span>{link.label}</span>
            <small>{link.description}</small>
          </span>
        </Link>
      ))}
    </nav>
  );
}
