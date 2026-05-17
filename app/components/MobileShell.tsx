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
            <p className="mobile-kicker">LifePilot</p>
            <p className="mobile-header-text">Помощник для писем и документов</p>
          </div>
          <span className="mobile-stage">MVP</span>
        </header>
        <section className="mobile-content">{children}</section>
        <MainNavigation />
      </div>
    </main>
  );
}
