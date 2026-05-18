import type { ReactNode } from "react";
import { MainNavigation } from "./MainNavigation";

type MobileShellProps = {
  children?: ReactNode;
};

export function MobileShell({ children }: MobileShellProps) {
  return (
    <main className="mobile-shell">
      <div className="mobile-frame">
        <header className="mobile-header">
          <div className="mobile-brand">
            <span className="mobile-brand-mark">LP</span>
            <div>
              <p className="mobile-kicker">LifePilot</p>
              <p className="mobile-header-text">Письма и документы</p>
            </div>
          </div>
          <div className="mobile-header-meta">
            <span className="mobile-stage">MVP</span>
            <span className="mobile-privacy">локально</span>
          </div>
        </header>
        <section className="mobile-content">{children}</section>
        <MainNavigation />
      </div>
    </main>
  );
}
