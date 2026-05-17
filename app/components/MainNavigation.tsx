import Link from "next/link";

const links = [
  { href: "/", label: "Главная", description: "Стартовый экран" },
  { href: "/onboarding", label: "Знакомство", description: "Границы продукта" },
  { href: "/case/new", label: "Новый кейс", description: "Создание кейса", primary: true },
  { href: "/case/analyzing", label: "Анализ", description: "Состояние обработки" },
  { href: "/case/result", label: "Результат", description: "Объяснение и план" },
  { href: "/case/draft", label: "Черновик", description: "Немецкий ответ" },
  { href: "/case/high-risk", label: "Риск", description: "Предупреждение" },
  { href: "/history", label: "История", description: "Сохраненные кейсы" },
  { href: "/settings/safety", label: "Безопасность", description: "Настройки MVP" },
  { href: "/error", label: "Ошибка", description: "Резервный экран" }
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
          <span>{link.label}</span>
          <small>{link.description}</small>
        </Link>
      ))}
    </nav>
  );
}
