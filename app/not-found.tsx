import { MobileShell } from "./components/MobileShell";

export default function NotFoundPage() {
  return (
    <MobileShell
      title="Страница не найдена"
      description="Fallback route для неизвестного маршрута."
    />
  );
}
