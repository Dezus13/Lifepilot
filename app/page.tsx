import Link from "next/link";

const quickActions = [
  {
    href: "/case/new",
    label: "Новый кейс",
    description: "Вставить письмо или документ",
    icon: "+"
  },
  {
    href: "/history",
    label: "История",
    description: "Открыть сохраненные кейсы",
    icon: "↺"
  },
  {
    href: "/settings/safety",
    label: "Безопасность",
    description: "Проверить ограничения MVP",
    icon: "◆"
  }
];

const mockCases = [
  {
    title: "Письмо от арендодателя",
    meta: "Жилье · сегодня",
    status: "Повышенный риск"
  },
  {
    title: "Запрос от страховой",
    meta: "Страховка · вчера",
    status: "Нужно проверить"
  }
];

export default function HomePage() {
  return (
    <div className="home-dashboard">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Учебный MVP · local first</span>
          <h1 className="mobile-title" id="home-title">
            Разберите письмо без лишнего шума
          </h1>
          <p>
            LifePilot помогает быстро понять текст, оценить риск и подготовить аккуратный черновик ответа.
          </p>
        </div>

        <Link className="button home-primary-action" href="/case/new">
          Новый кейс
        </Link>
      </section>

      <section className="home-overview" aria-label="Обзор статусов">
        <div className="overview-tile">
          <span>Кейсы</span>
          <strong>2</strong>
          <small>mock данные</small>
        </div>
        <div className="overview-tile overview-tile-warning">
          <span>Риск</span>
          <strong>1</strong>
          <small>требует внимания</small>
        </div>
        <div className="overview-tile">
          <span>Хранение</span>
          <strong>Local</strong>
          <small>без backend</small>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Быстрые действия</h2>
          <p>Основные шаги MVP в один тап.</p>
        </div>

        <div className="quick-actions">
          {quickActions.map((action) => (
            <Link className="quick-action-card" href={action.href} key={action.href}>
              <span className="quick-action-icon" aria-hidden="true">
                {action.icon}
              </span>
              <span>
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Последние кейсы</h2>
          <p>Пример того, как будет выглядеть история.</p>
        </div>

        <div className="mock-case-list">
          {mockCases.map((mockCase) => (
            <article className="mock-case-card" key={mockCase.title}>
              <div>
                <h3>{mockCase.title}</h3>
                <p>{mockCase.meta}</p>
              </div>
              <span className="case-status-chip">{mockCase.status}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
