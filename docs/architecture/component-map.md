# Карта компонентов MVP LifePilot

## Назначение документа

Этот документ описывает компонентную карту frontend MVP без реализации компонентов. Он показывает, какие блоки нужны каждому экрану, какие части переиспользуются, где находятся зоны состояния, риска, warning, немецкого черновика, истории, loading и error.

Названия компонентов условные. Они нужны для архитектурного ориентирования, а не для немедленного создания файлов.

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
- история отключена;
- onboarding не пройден.

### Risk zones

- preview сохраненных кейсов с чувствительными данными;
- переход к прошлому high-risk кейсу;
- слишком сильное обещание помощи на главном CTA.

### Warning components

- `SafetyReminder`;
- `HistoryDisabledNotice`, если история выключена.

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
- `CaseCategorySelect`;
- `NeedGermanDraftToggle`;
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
- слишком короткий текст;
- текст достаточный для анализа;
- выбрана категория;
- нужен немецкий черновик;
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

- `NeedGermanDraftToggle`.

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
- анализ требует уточнения;
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
- `SaveCaseAction`;
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
- немецкий черновик разрешен;
- доступен только общий шаблон;
- сохранение включено или выключено.

### Risk zones

- сроки;
- суммы;
- требования;
- неясные места;
- high-risk статус;
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
- `TemplateOnlyNotice`.

### History components

- `SaveCaseAction`;
- `SavedStateNotice`.

### Loading и error states

- loading при сохранении;
- ошибка сохранения;
- ошибка отсутствия результата;
- empty-state для неполного анализа.

## Немецкий черновик

### Список компонентов

- `ScreenLayout`;
- `DraftSafetyNotice`;
- `DraftToneSelector`;
- `GermanDraftText`;
- `DraftPlaceholderList`;
- `DraftExplanation`;
- `CopyDraftAction`;
- `SaveDraftToCaseAction`;
- `BackToAnalysisAction`.

### Переиспользуемые блоки

- `WarningBanner`;
- `DangerBanner`;
- `PlaceholderList`;
- `BottomActions`;
- `SafeNotice`;
- `ErrorState`.

### State zones

- черновик формируется;
- черновик готов;
- доступен только общий шаблон;
- есть плейсхолдеры;
- скопировано;
- сохранено;
- копирование заблокировано из-за риска.

### Risk zones

- копирование без проверки;
- плейсхолдеры;
- признание вины или согласие;
- юридически значимый текст;
- high-risk кейс.

### Warning components

- `DraftSafetyNotice`;
- `PlaceholderWarning`;
- `CopyCheckReminder`;
- `TemplateOnlyWarning`.

### Draft components

- `GermanDraftText`;
- `DraftToneSelector`;
- `DraftPlaceholderList`;
- `DraftExplanation`;
- `CopyDraftAction`.

### History components

- `SaveDraftToCaseAction`;
- `SavedStateNotice`.

### Loading и error states

- loading генерации;
- ошибка генерации;
- fallback на общий шаблон;
- empty-state, если черновик не разрешен.

## История кейсов

### Список компонентов

- `ScreenLayout`;
- `HistoryList`;
- `CaseHistoryItem`;
- `CaseStatusBadge`;
- `CaseRiskBadge`;
- `HistoryEmptyState`;
- `HistoryDisabledState`;
- `StartNewCaseAction`.

### Переиспользуемые блоки

- `EmptyState`;
- `StatusBadge`;
- `WarningBanner`;
- `InfoCard`;
- `BottomActions`.

### State zones

- история пуста;
- история отключена;
- история загружается;
- есть сохраненные кейсы;
- ошибка чтения истории.

### Risk zones

- отображение чувствительных данных;
- открытие high-risk кейса без предупреждения;
- устаревший результат.

### Warning components

- `HistoryPrivacyNotice`;
- `HighRiskCaseBadge`;
- `HistoryDisabledNotice`.

### Draft components

- краткий признак наличия черновика, без полного текста.

### History components

- `HistoryList`;
- `CaseHistoryItem`;
- `HistoryEmptyState`;
- `HistoryDisabledState`.

### Loading и error states

- loading списка;
- empty-state;
- disabled-state;
- ошибка чтения.

## Настройки безопасности

### Список компонентов

- `ScreenLayout`;
- `SafetyRulesSummary`;
- `HistorySavingToggle`;
- `ExplanationLanguageSetting`;
- `DefaultDraftToneSetting`;
- `DetailLevelSetting`;
- `PrivacyNotice`;
- `BackAction`.

### Переиспользуемые блоки

- `WarningBanner`;
- `InfoCard`;
- `Section`;
- `BottomActions`.

### State zones

- история включена;
- история выключена;
- настройки изменены;
- настройки сохранены;
- ошибка сохранения настроек.

### Risk zones

- пользователь думает, что настройки дают юридическую защиту;
- неявное сохранение истории;
- изменение настроек влияет на будущие кейсы, но не должно переписывать прошлые.

### Warning components

- `SafetyRulesSummary`;
- `PrivacyNotice`;
- `HistorySavingWarning`.

### Draft components

- `DefaultDraftToneSetting`.

### History components

- `HistorySavingToggle`.

### Loading и error states

- loading чтения настроек;
- ошибка сохранения;
- confirmation-state после изменения.

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
- ошибка генерации черновика;
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

- не используются, кроме ошибки генерации черновика.

### History components

- не используются, кроме ошибки сохранения или чтения истории.

### Loading и error states

- экран сам является error-state;
- retry должен быть доступен только для временных ошибок.

## High-risk warning

### Список компонентов

- `ScreenLayout`;
- `HighRiskSummary`;
- `RiskFactsList`;
- `LegalBoundaryNotice`;
- `SpecialistRecommendation`;
- `BackToResultAction`;
- `GetGeneralTemplateAction`;
- `SaveCaseAction`.

### Переиспользуемые блоки

- `DangerBanner`;
- `WarningBanner`;
- `FactList`;
- `BottomActions`;
- `StatusBadge`.

### State zones

- конкретный черновик заблокирован;
- общий шаблон доступен;
- общий шаблон недоступен;
- кейс сохранен;
- пользователь возвращается к результату.

### Risk zones

- обход блокировки конкретного ответа;
- слишком мягкое предупреждение;
- слишком пугающее предупреждение без полезного действия;
- неясная причина высокого риска.

### Warning components

- `HighRiskSummary`;
- `LegalBoundaryNotice`;
- `SpecialistRecommendation`.

### Draft components

- `GetGeneralTemplateAction`;
- `TemplateOnlyNotice`.

### History components

- `SaveCaseAction`;
- `SavedStateNotice`.

### Loading и error states

- loading при создании общего шаблона;
- ошибка создания шаблона;
- fallback к результату анализа.

## Связанные документы

- [frontend-structure.md](./frontend-structure.md) описывает будущую структуру frontend.
- [routing-map.md](./routing-map.md) описывает маршруты и переходы.
- [../plans/screens-flow.md](../plans/screens-flow.md) описывает экраны MVP.
- [../design/design-system.md](../design/design-system.md) описывает базовые UI-состояния.
