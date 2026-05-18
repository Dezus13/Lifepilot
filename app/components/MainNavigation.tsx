import Link from "next/link";

const links = [
  { href: "/", label: "Главная", description: "Стартовый экран", icon: "home" },
  { href: "/onboarding", label: "Знакомство", description: "Границы продукта", icon: "info" },
  { href: "/case/new", label: "Новый кейс", description: "Создание кейса", icon: "plus", primary: true },
  { href: "/case/analyzing", label: "Анализ", description: "Состояние обработки", icon: "scan" },
  { href: "/case/result", label: "Результат", description: "Объяснение и план", icon: "result" },
  { href: "/case/draft", label: "Черновик", description: "Немецкий ответ", icon: "draft" },
  { href: "/case/high-risk", label: "Риск", description: "Предупреждение", icon: "risk" },
  { href: "/history", label: "История", description: "Сохраненные кейсы", icon: "history" },
  { href: "/settings/safety", label: "Безопасность", description: "Настройки MVP", icon: "shield" },
  { href: "/error", label: "Ошибка", description: "Резервный экран", icon: "error" }
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
