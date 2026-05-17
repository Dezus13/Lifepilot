import { MainNavigation } from "./MainNavigation";

type MobileShellProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function MobileShell({ title, description, children }: MobileShellProps) {
  return (
    <main className="mobile-shell">
      <header className="mobile-header">
        <h1 className="mobile-title">{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>
      <section className="mobile-content">
        {children ?? (
          <div className="placeholder-panel">
            <p>Пустой scaffold-экран. Содержимое будет добавлено на следующих этапах.</p>
          </div>
        )}
      </section>
      <MainNavigation />
    </main>
  );
}
