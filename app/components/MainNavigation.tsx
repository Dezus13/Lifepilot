import Link from "next/link";

const links = [
  { href: "/", label: "Главная", primary: true },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/case/new", label: "Новый кейс" },
  { href: "/case/analyzing", label: "Анализ" },
  { href: "/case/result", label: "Результат" },
  { href: "/case/draft", label: "Черновик" },
  { href: "/history", label: "История" },
  { href: "/settings/safety", label: "Безопасность" }
];

export function MainNavigation() {
  return (
    <nav className="mobile-navigation" aria-label="Основная навигация">
      {links.map((link) => (
        <Link
          className={link.primary ? "nav-link primary" : "nav-link"}
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
