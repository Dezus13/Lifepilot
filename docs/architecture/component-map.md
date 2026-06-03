# Карта компонентов MVP LifePilot

## Назначение документа

Этот документ описывает компонентную карту frontend MVP без реализации компонентов. Он показывает, какие блоки нужны каждому экрану, какие части переиспользуются, где находятся зоны состояния, риска, warning, немецкого черновика, истории, loading и error.

Названия компонентов условные. Они нужны для архитектурного ориентирования, а не для немедленного создания файлов.

Каноническая структура Case, `StoredCase`, `SupabaseCaseRow`, статусы и жизненный цикл описаны в [../specs/case-model.md](../specs/case-model.md). Этот документ не вводит альтернативные поля или статусы Case.

## Общие переиспользуемые блоки

Базовые блоки для нескольких экранов:

- `ScreenLayout` — структура экрана с header, content и bottom actions.
- `ScreenHeader` — заголовок, назад, статус, risk indicator.
- `BottomActions` — нижняя зона основного действия.
- `Section` — смысловая секция контента.
- `InfoCard` — нейтральная карточка.
- `WarningBanner` — предупреждение.
- `DangerBanner` — высокий риск.
- `SafeNotice` — безопасное или успешное состояние.
- `StatusBadge` — статус кейса.
- `EmptyState` — пустое состояние.
- `LoadingState` — состояние ожидания.
- `ErrorState` — состояние ошибки.
- `FactList` — список дат, сумм и требований.
- `PlaceholderList` — список плейсхолдеров.

## Onboarding

### Список компонентов

- `ScreenLayout`;
- `OnboardingIntro`;
- `SafetyLimitsSummary`;
- `AiCanBeWrongNotice`;
- `DraftIsNotFinalNotice`;
- `PrimaryAction`;
- `SecondaryAction` для настроек безопасности, если нужно.

### Переиспользуемые блоки

- `WarningBanner`;
- `Section`;
- `BottomActions`.

### State zones

- первое открытие;
- onboarding уже пройден;
- переход к настройкам безопасности.

### Risk zones

- юридическая граница;
- ожидания пользователя по точности AI;
- обещание результата.

### Warning components

- `SafetyLimitsSummary`;
- `AiCanBeWrongNotice`.

### Draft components

- не используются.

### History components

- не используются.

### Loading и error states

- loading не нужен;
- error возможен только при невозможности сохранить факт прохождения onboarding.

## Главный экран

### Список компонентов

- `ScreenLayout`;
- `HomeHeader`;
- `StartCaseAction`;
- `RecentCasesPreview`;
- `SafetyReminder`;
- `HistoryLink`;
- `SafetySettingsLink`;
- `EmptyRecentCasesState`.

### Переиспользуемые блоки

- `InfoCard`;
- `StatusBadge`;
- `SafeNotice`;
- `EmptyState`;
- `BottomActions`.

### State zones

- нет сохраненных кейсов;
- есть последние кейсы;
- onboarding не пройден.

### Risk zones

- preview сохраненных кейсов с чувствительными данными;
- переход к прошлому high-risk кейсу;
- слишком сильное обещание помощи на главном CTA.

### Warning components

- `SafetyReminder`;
- предупреждение о локальном хранении истории.

### Draft components

- не используются.

### History components

- `RecentCasesPreview`;
- `CasePreviewItem`.

### Loading и error states

- loading истории;
- ошибка чтения локальной истории;
- пустое состояние.

## Создание кейса

### Список компонентов

- `ScreenLayout`;
- `CaseTextInput`;
- `LocalCategoryResult`;
- `MinimumContextHint`;
- `InputValidationWarning`;
- `StartAnalysisAction`;
- `UnsavedCaseNotice`.

### Переиспользуемые блоки

- `WarningBanner`;
- `Section`;
- `BottomActions`;
- `ErrorState`.

### State zones

- пустой текст;
- короткий или неполный текст;
- текст достаточный для анализа;
- категория определена локальным анализом;
- немецкий черновик доступен как текущий нейтральный draft flow;
- есть несохраненный ввод.

### Risk zones

- запуск анализа без контекста;
- неверная категория;
- пользователь вставил неполный документ;
- смешанные языки.

### Warning components

- `InputValidationWarning`;
- `MinimumContextHint`;
- `MixedLanguageWarning`;
- `IncompleteDocumentWarning`.

### Draft components

- отдельный toggle немецкого черновика в текущем UI не используется.

### History components

- не используются.

### Loading и error states

- disabled-состояние кнопки запуска;
- inline-error для пустого текста;
- переход на общий экран ошибки при системном сбое.

## Анализ документа

### Список компонентов

- `ScreenLayout`;
- `AnalysisProgress`;
- `AnalysisStepText`;
- `CheckResultReminder`;
- `CancelOrBackAction`;
- `AnalysisLoadingState`.

### Переиспользуемые блоки

- `LoadingState`;
- `WarningBanner`;
- `BottomActions`.

### State zones

- анализ запущен;
- анализ завершен;
- анализу не хватает данных;
- обнаружен высокий риск;
- анализ завершился ошибкой.

### Risk zones

- пользователь воспринимает анализ как гарантию;
- возврат назад с потерей введенного текста;
- долгое ожидание без объяснения.

### Warning components

- `CheckResultReminder`;
- `ProcessingRiskNotice`, если анализ уже видит риск.

### Draft components

- не показываются.

### History components

- не используются.

### Loading и error states

- основной loading;
- retry-state для временной ошибки;
- error-state для невозможности анализа;
- сохранение введенного текста при ошибке.

## Результат анализа

### Список компонентов

- `ScreenLayout`;
- `CaseSummaryCard`;
- `PlainExplanationSection`;
- `ImportantFactsSection`;
- `RequirementsSection`;
- `UnknownsSection`;
- `WarningsSection`;
- `ActionPlanSection`;
- `GoToDraftAction`;
- `EditSourceTextAction`.

### Переиспользуемые блоки

- `InfoCard`;
- `WarningBanner`;
- `DangerBanner`;
- `FactList`;
- `StatusBadge`;
- `BottomActions`;
- `SafeNotice`.

### State zones

- результат полный;
- требуется уточнение;
- высокий риск;
- немецкий черновик доступен при наличии текущего кейса;
- будущий template-only режим вместо конкретного черновика.

### Risk zones

- сроки;
- суммы;
- требования;
- неясные места;
- high-risk warning;
- переход к черновику.

### Warning components

- `WarningsSection`;
- `HighRiskInlineNotice`;
- `NeedsClarificationNotice`;
- `DeadlineWarning`;
- `IncompleteDocumentWarning`.

### Draft components

- `GoToDraftAction`;
- `DraftAvailabilityNotice`;
- будущий `TemplateOnlyNotice`.

### History components

Кейс уже сохраняется локально после запуска анализа. На экране результата нет отдельного действия сохранения.

### Loading и error states

- ошибка отсутствия результата;
- empty-state для неполного анализа.

## Немецкий черновик

### Список компонентов

- `ScreenLayout`;
- `DraftSafetyNotice`;
- текущий нейтральный тон без отдельного selector;
- `GermanDraftText`;
- `BackToAnalysisAction`.

### Переиспользуемые блоки

- `WarningBanner`;
- `DangerBanner`;
- `BottomActions`;
- `SafeNotice`;
- `ErrorState`.

### State zones

- черновик готов;
- будущий template-only режим доступен;
- пользователь должен проверить текст вручную.

### Risk zones

- использование без проверки;
- плейсхолдеры;
- признание вины или согласие;
- юридически значимый текст;
- high-risk кейс.

### Warning components

- `DraftSafetyNotice`;
- будущий `TemplateOnlyWarning`.

### Draft components

- `GermanDraftText`;
- текущий нейтральный тон без отдельного selector.

### History components

Черновик не создает отдельной записи в истории и не сохраняет отдельное состояние.

### Loading и error states

- empty-state, если текущий кейс отсутствует;
- будущий fallback на template-only режим.

## История кейсов

### Список компонентов

- `ScreenLayout`;
- `HistoryList`;
- `CaseHistoryItem`;
- `CaseStatusBadge`;
- `CaseRiskBadge`;
- `HistoryEmptyState`;
- `StartNewCaseAction`.

### Переиспользуемые блоки

- `EmptyState`;
- `StatusBadge`;
- `WarningBanner`;
- `InfoCard`;
- `BottomActions`.

### State zones

- история пуста;
- история загружается;
- есть сохраненные кейсы;
- ошибка чтения истории.

### Risk zones

- отображение чувствительных данных;
- открытие high-risk кейса без предупреждения;
- устаревший результат.

### Warning components

- `HistoryPrivacyNotice`;
- `HighRiskCaseBadge`.

### Draft components

- краткий признак наличия черновика, без полного текста.

### History components

- `HistoryList`;
- `CaseHistoryItem`;
- `HistoryEmptyState`.

### Loading и error states

- loading списка;
- empty-state;
- ошибка чтения.

## Настройки безопасности

### Список компонентов

- `ScreenLayout`;
- `SafetyRulesSummary`;
- `DraftToneInfo`;
- `PrivacyNotice`;
- `BackAction`.

### Переиспользуемые блоки

- `WarningBanner`;
- `InfoCard`;
- `Section`;
- `BottomActions`.

### State zones

- статический safety content загружен;
- пользователь возвращается на главный экран.

### Risk zones

- пользователь думает, что safety screen дает юридическую защиту;
- пользователь думает, что экран меняет параметры хранения или тон черновика;
- экран не должен переписывать прошлые кейсы.

### Warning components

- `SafetyRulesSummary`;
- `PrivacyNotice`.

### Draft components

- `DraftToneInfo`.

### History components

На экране безопасности нет элементов управления историей. История управляется локальным MVP-flow и очищается на экране истории.

### Loading и error states

Для текущего статического экрана не нужны loading, save-error или confirmation-state. Если экран недоступен, используется общий fallback route.

## Экран ошибки

### Список компонентов

- `ScreenLayout`;
- `ErrorMessage`;
- `ErrorReason`;
- `SafeNextStep`;
- `RetryAction`;
- `BackAction`;
- `GoHomeAction`.

### Переиспользуемые блоки

- `ErrorState`;
- `WarningBanner`;
- `BottomActions`.

### State zones

- ошибка ввода;
- ошибка анализа;
- ошибка открытия черновика;
- ошибка сохранения;
- неизвестная ошибка.

### Risk zones

- потеря введенного текста;
- повтор действия при недостаточном контексте;
- слишком технический текст ошибки.

### Warning components

- `InputRecoveryNotice`;
- `ContextRequiredNotice`.

### Draft components

- не используются, кроме ошибки открытия черновика из-за отсутствия текущего кейса.

### History components

- не используются, кроме ошибки сохранения или чтения истории.

### Loading и error states

- экран сам является error-state;
- retry должен быть доступен только для временных ошибок.

## High-risk warning

### Список компонентов

- `ScreenLayout`;
- `HighRiskSummary`;
- `LegalBoundaryNotice`;
- `SpecialistRecommendation`;
- `BackToSafeScreenAction`.

### Переиспользуемые блоки

- `DangerBanner`;
- `WarningBanner`;
- `FactList`;
- `BottomActions`;
- `StatusBadge`.

### State zones

- статическое предупреждение показано;
- пользователь возвращается к безопасному экрану;
- будущая блокировка конкретного черновика не реализована в текущем UI.

### Risk zones

- обход предупреждения о рискованном ответе;
- слишком мягкое предупреждение;
- слишком пугающее предупреждение без полезного действия;
- неясная причина высокого риска.

### Warning components

- `HighRiskSummary`;
- `LegalBoundaryNotice`;
- `SpecialistRecommendation`.

### Draft components

- будущий `GetGeneralTemplateAction`;
- будущий `TemplateOnlyNotice`.

### History components

- в текущем статическом экране не используются.

### Loading и error states

- будущий loading при создании общего шаблона;
- будущая ошибка создания шаблона;
- fallback к результату анализа.

## Связанные документы

- [frontend-structure.md](./frontend-structure.md) описывает будущую структуру frontend.
- [routing-map.md](./routing-map.md) описывает маршруты и переходы.
- [../plans/screens-flow.md](../plans/screens-flow.md) описывает экраны MVP.
- [../design/design-system.md](../design/design-system.md) описывает базовые UI-состояния.
