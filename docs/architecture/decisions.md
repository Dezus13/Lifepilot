# Architecture Decisions

## ADR-001 Local First Storage

Решение: пользовательский MVP хранит текущий кейс и историю в `localStorage`.

Причина: MVP должен быстро проверить основную ценность без backend, аккаунтов и синхронизации. Локальное хранение снижает инфраструктурную сложность и оставляет пользовательские данные на устройстве.

Следствие: данные не синхронизируются между устройствами и могут быть потеряны при очистке браузера. Для production-хранения потребуется отдельный Supabase/database этап.

## ADR-002 No Auth In MVP

Решение: user-facing Auth не входит в текущий MVP.

Причина: первая версия проверяет основной сценарий: вставить текст, получить объяснение, risk level, priority и action plan. Аккаунты, user ownership и sync увеличивают scope и требуют отдельного security review.

Следствие: пользовательский flow остается публичным и local-first. Admin Auth Foundation существует отдельно и не подключается к пользовательским кейсам.

## ADR-003 Rule Based Analysis

Решение: анализ MVP работает локально через rule-based логику.

Причина: для текущего MVP важно показать предсказуемый результат без внешних AI API, backend и передачи чувствительного текста третьим сервисам.

Следствие: анализ ограничен ключевыми словами и простыми правилами. Результат помогает ориентироваться, но не является юридической, финансовой или административной консультацией.

## ADR-004 Future Supabase Integration

Решение: Supabase подготовлен как Technical Foundation, но не используется как рабочее хранилище пользовательского MVP.

Причина: подключение database требует user-facing Auth, RLS review, ownership model, production security review и миграцию local-first flow.

Следствие: `public.cases`, Supabase client и related types остаются foundation-слоем. Переход к Supabase должен быть отдельным этапом после стабилизации MVP и отдельного approved active plan с обновленными specs, RLS review, ownership model и migration/fallback strategy.
