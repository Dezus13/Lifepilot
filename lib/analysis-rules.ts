import { buildActionPlan } from "./action-plan";

export type RiskLevel = "low" | "medium" | "high";
export type CaseStatus = "new" | "analyzed" | "action-required" | "waiting" | "completed";
export type CaseCategory = "Жильё" | "Банк" | "Страховка" | "Госорган" | "Работа" | "Документы" | "Другое";
export type DocumentImportance = "Information" | "Termin" | "Dokumentenanforderung" | "Rechnung" | "Mahnung" | "Kündigung";
export type PriorityLevel = "critical" | "high" | "medium" | "low";
export type DeadlineStatus = "overdue" | "urgent" | "upcoming" | "normal" | "unknown";

export type ContactData = {
  emails: string[];
  phones: string[];
  websites: string[];
};

export type ExtractedData = {
  documentType: string | null;
  documentImportance: DocumentImportance | null;
  organization: string | null;
  caseNumber: string | null;
  requiredAction: string | null;
  deadline: string | null;
  deadlines: string[];
  amount: string | null;
  contacts: ContactData;
  consequences: string[];
  isDeadlineSoon: boolean;
};

export type LocalAnalysis = {
  category: CaseCategory;
  status: CaseStatus;
  riskLevel: RiskLevel;
  foundKeywords: string[];
  riskKeywords: string[];
  riskReason: string;
  explanation: string;
  prioritySummary: string;
  priorityLevel: PriorityLevel;
  deadlineStatus: DeadlineStatus;
  daysRemaining: number | null;
  deadlineMessage: string;
  actionPlan: string[];
  recommendedActions: string[];
  extractedData: ExtractedData;
};

export type PrioritySummaryInput = {
  organization: string | null;
  documentType: DocumentImportance | string | null;
  requiredAction: string | null;
  deadlines: string[];
  amount: string | null;
  consequences: string[];
  riskLevel: RiskLevel;
};

export type DeadlineStatusResult = {
  status: DeadlineStatus;
  daysRemaining: number | null;
  deadlineMessage: string;
  deadline: string | null;
};

export type CaseStatusInput = {
  deadline: string | null;
  deadlines: string[];
  riskLevel: RiskLevel;
  actionPlan: string[];
};

const caseStatuses: CaseStatus[] = ["new", "analyzed", "action-required", "waiting", "completed"];

const legacyCaseStatusMap: Record<string, CaseStatus> = {
  черновик: "new",
  создан: "new",
  проанализирован: "analyzed",
  объяснен: "analyzed",
  "план создан": "action-required",
  "ответ создан": "waiting",
  сохранен: "analyzed",
  "требует уточнения": "action-required",
  "высокий риск": "action-required"
};

const categoryKeywordGroups: Array<{
  category: CaseCategory;
  keywords: string[];
}> = [
  { category: "Жильё", keywords: ["wohnung", "miete", "vermieter", "mietvertrag", "genossenschaft"] },
  { category: "Страховка", keywords: ["versicherung", "schaden", "polizze"] },
  { category: "Работа", keywords: ["ams", "arbeit", "bewerbung", "dienstgeber", "vertrag"] },
  { category: "Документы", keywords: ["formular", "antrag", "behörde", "amt", "ma40"] }
];

const riskKeywordGroups: Record<RiskLevel, string[]> = {
  high: ["frist", "kündigung", "mahnung", "zahlung", "strafe"],
  medium: ["nachweis", "bestätigung", "unterlagen"],
  low: ["information", "mitteilung"]
};

const organizationRules: Array<{
  organization: string;
  keywords: string[];
}> = [
  { organization: "AMS", keywords: ["ams"] },
  { organization: "MA40", keywords: ["ma40"] },
  { organization: "ÖGK", keywords: ["ögk", "oegk", "gesundheitskasse"] },
  { organization: "Finanzamt", keywords: ["finanzamt"] },
  { organization: "Wiener Wohnen", keywords: ["wiener wohnen"] },
  { organization: "Versicherung", keywords: ["versicherung"] },
  { organization: "Arbeitgeber", keywords: ["arbeitgeber", "dienstgeber"] },
  { organization: "арендодатель", keywords: ["vermieter"] },
  { organization: "страховая", keywords: ["versicherung", "polizze"] },
  { organization: "кооператив", keywords: ["genossenschaft"] },
  { organization: "госорган", keywords: ["behörde", "amt"] }
];

const documentImportanceRules: Array<{
  documentImportance: DocumentImportance;
  keywords: string[];
}> = [
  { documentImportance: "Kündigung", keywords: ["kündigung", "kuendigung", "vertragsauflösung", "vertragsaufloesung"] },
  { documentImportance: "Mahnung", keywords: ["mahnung", "zahlungsaufforderung", "verzug"] },
  { documentImportance: "Rechnung", keywords: ["rechnung", "honorarnote", "zahlbetrag"] },
  {
    documentImportance: "Dokumentenanforderung",
    keywords: ["anforderung von unterlagen", "unterlagen", "nachweis", "nachweise", "einreichen", "vorlegen"]
  },
  { documentImportance: "Termin", keywords: ["terminmitteilung", "termin", "vorsprache", "erscheinen"] },
  { documentImportance: "Information", keywords: ["informationsschreiben", "information", "mitteilung", "hinweis"] }
];

const requiredActionRules: Array<{
  action: string;
  keywords: string[];
}> = [
  { action: "предоставить документы", keywords: ["unterlagen", "nachweis", "anforderung", "einreichen", "vorlegen", "senden"] },
  { action: "оплатить сумму", keywords: ["zahlung", "betrag", "rechnung", "bezahlen", "überweisen", "ueberweisen"] },
  { action: "явиться на термин", keywords: ["termin", "erscheinen", "vorsprache"] },
  { action: "подтвердить данные", keywords: ["bestätigung", "bestaetigung", "bestätigen", "bestaetigen", "daten"] },
  { action: "ответить на письмо", keywords: ["antwort", "antworten", "rückmeldung", "rueckmeldung", "stellungnahme"] }
];

const consequenceRules: Array<{
  consequence: string;
  keywords: string[];
}> = [
  { consequence: "прекращение выплаты", keywords: ["einstellung", "leistung", "bezug", "zahlung eingestellt"] },
  { consequence: "штраф", keywords: ["strafe", "sanktion", "verwaltungsstrafe"] },
  { consequence: "инкассо", keywords: ["inkasso", "inkassobüro", "inkassobuero"] },
  { consequence: "расторжение договора", keywords: ["kündigung", "kuendigung", "vertrag", "mietvertrag"] },
  { consequence: "просрочка", keywords: ["mahnung", "verzug", "verspätung", "verspaetung", "frist versäumt", "frist versaeumt"] },
  { consequence: "дополнительная проверка", keywords: ["prüfung", "pruefung", "überprüfung", "ueberpruefung", "nachprüfung", "nachpruefung"] }
];

const categoryRecommendations: Record<CaseCategory, string[]> = {
  Жильё: ["Проверить срок ответа.", "Сохранить письмо.", "Проверить договор аренды."],
  Банк: ["Проверить сумму и назначение платежа.", "Сверить номер документа или договора.", "Не подтверждать спорный долг без проверки."],
  Страховка: ["Проверить требуемые документы.", "Проверить сумму и сроки.", "Сохранить номер полиса или дела."],
  Госорган: ["Проверить срок ответа.", "Подготовить требуемые документы.", "Сохранить номер дела или письма."],
  Работа: ["Проверить срок подачи документов.", "Подготовить Nachweis, если он требуется.", "Не пропустить Frist."],
  Документы: ["Проверить, какой формуляр или Antrag нужен.", "Подготовить подтверждения.", "Проверить адрес учреждения и срок подачи."],
  Другое: ["Проверить, достаточно ли текста для разбора.", "Сохранить письмо.", "Перед ответом проверить отправителя и цель письма."]
};

const riskRecommendations: Record<RiskLevel, string[]> = {
  low: ["Проверить общий смысл письма.", "Сохранить кейс для истории."],
  medium: ["Проверить список Unterlagen или Nachweis.", "Сверить сроки, имена и номера документов перед ответом."],
  high: ["Не отправлять ответ автоматически.", "Сначала проверить Frist, Zahlung, Mahnung или Strafe.", "При сомнении обратиться к специалисту."]
};

const riskReasons: Record<RiskLevel, string> = {
  low: "В документе не найдены признаки срочного требования, оплаты, штрафа или расторжения.",
  medium: "В документе найдены признаки запроса подтверждений или документов.",
  high: "В документе найдены признаки требования оплаты, предупреждения, штрафа или установленного срока."
};

function normalizeText(sourceText: string) {
  return sourceText.toLowerCase();
}

function findKeywords(sourceText: string, keywords: string[]) {
  const normalizedText = normalizeText(sourceText);

  return keywords.filter((keyword) => normalizedText.includes(keyword));
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

export function normalizeCaseStatus(status: unknown, fallback: CaseStatus = "new"): CaseStatus {
  if (typeof status !== "string") {
    return fallback;
  }

  if (caseStatuses.includes(status as CaseStatus)) {
    return status as CaseStatus;
  }

  return legacyCaseStatusMap[status] ?? fallback;
}

function cleanExtractedValue(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s(?:bitte|wir|sie|ihre|ihr|der|die|das|vom|am|frist|termin|datum)\b.*$/i, "")
    .replace(/[.,;:)\]]+$/g, "")
    .trim();
}

function classifyCategory(sourceText: string): { category: CaseCategory; foundKeywords: string[] } {
  const matchedGroup = categoryKeywordGroups.find((group) => findKeywords(sourceText, group.keywords).length > 0);

  if (!matchedGroup) {
    return { category: "Другое", foundKeywords: [] };
  }

  return {
    category: matchedGroup.category,
    foundKeywords: findKeywords(sourceText, matchedGroup.keywords)
  };
}

export function classifyRisk(sourceText: string): { riskLevel: RiskLevel; foundKeywords: string[] } {
  const highMatches = findKeywords(sourceText, riskKeywordGroups.high);

  if (highMatches.length > 0) {
    return { riskLevel: "high", foundKeywords: highMatches };
  }

  const mediumMatches = findKeywords(sourceText, riskKeywordGroups.medium);

  if (mediumMatches.length > 0) {
    return { riskLevel: "medium", foundKeywords: mediumMatches };
  }

  const lowMatches = findKeywords(sourceText, riskKeywordGroups.low);

  if (lowMatches.length > 0) {
    return { riskLevel: "low", foundKeywords: lowMatches };
  }

  return { riskLevel: "low", foundKeywords: [] };
}

export function getRiskLevel(sourceText: string): RiskLevel {
  return classifyRisk(sourceText).riskLevel;
}

function detectOrganization(sourceText: string) {
  const matchedRule = organizationRules.find((rule) => findKeywords(sourceText, rule.keywords).length > 0);

  return matchedRule?.organization ?? null;
}

export function detectDocumentImportance(sourceText: string): DocumentImportance | null {
  const matchedRule = documentImportanceRules.find((rule) => findKeywords(sourceText, rule.keywords).length > 0);

  return matchedRule?.documentImportance ?? null;
}

function detectDocumentType(sourceText: string) {
  return detectDocumentImportance(sourceText);
}

export function detectCaseNumber(sourceText: string) {
  const caseNumberPattern =
    /\b(?:geschäftszahl|geschaeftszahl|aktenzeichen|referenznummer|kundennummer|fallnummer)\s*(?:nr\.?|nummer)?\s*[:#-]?\s*([^\n\r,;]{2,60})/gi;
  const matches = Array.from(sourceText.matchAll(caseNumberPattern));

  for (const match of matches) {
    const value = cleanExtractedValue(match[1] ?? "");

    if (value) {
      return value;
    }
  }

  return null;
}

function detectRequiredAction(sourceText: string) {
  const matchedRule = requiredActionRules.find((rule) => findKeywords(sourceText, rule.keywords).length > 0);

  return matchedRule?.action ?? null;
}

function detectConsequences(sourceText: string) {
  return consequenceRules
    .filter((rule) => findKeywords(sourceText, rule.keywords).length > 0)
    .map((rule) => rule.consequence);
}

function formatDate(day: number, month: number, year: number) {
  const normalizedYear = year < 100 ? 2000 + year : year;
  const dayText = String(day).padStart(2, "0");
  const monthText = String(month).padStart(2, "0");

  return `${dayText}.${monthText}.${normalizedYear}`;
}

function parseDate(value: string) {
  const match = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const normalizedYear = year < 100 ? 2000 + year : year;
  const date = new Date(normalizedYear, month - 1, day);

  if (date.getFullYear() !== normalizedYear || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return {
    date,
    formatted: formatDate(day, month, year)
  };
}

function detectDeadlineEntries(sourceText: string) {
  const datePattern = /\b\d{1,2}[./-]\d{1,2}[./-](?:\d{2}|\d{4})\b/g;
  const dates = sourceText.match(datePattern) ?? [];
  const deadlineEntries: Array<{ date: Date; formatted: string }> = [];
  const seenDates = new Set<string>();

  for (const dateText of dates) {
    const parsedDate = parseDate(dateText);

    if (parsedDate && !seenDates.has(parsedDate.formatted)) {
      deadlineEntries.push(parsedDate);
      seenDates.add(parsedDate.formatted);
    }
  }

  return deadlineEntries;
}

export function detectMultipleDeadlines(sourceText: string) {
  return detectDeadlineEntries(sourceText).map((deadline) => deadline.formatted);
}

function detectDeadline(sourceText: string) {
  return detectDeadlineEntries(sourceText)[0] ?? null;
}

function isDeadlineSoon(deadline: Date | null) {
  if (!deadline) {
    return false;
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadlineStart = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const diffInDays = Math.ceil((deadlineStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  return diffInDays >= 0 && diffInDays <= 14;
}

function findNearestDeadline(deadlines: string[]) {
  const parsedDeadlines = deadlines
    .map((deadlineText) => parseDate(deadlineText))
    .filter((deadline): deadline is { date: Date; formatted: string } => Boolean(deadline))
    .sort((firstDeadline, secondDeadline) => firstDeadline.date.getTime() - secondDeadline.date.getTime());

  return parsedDeadlines[0] ?? null;
}

function getTodayStart() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function getDayWord(days: number) {
  const normalizedDays = Math.abs(days);
  const lastTwoDigits = normalizedDays % 100;
  const lastDigit = normalizedDays % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "дней";
  }

  if (lastDigit === 1) {
    return "день";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  }

  return "дней";
}

function findRelevantDeadline(deadlines: string[]) {
  const todayStart = getTodayStart();
  const parsedDeadlines = deadlines
    .map((deadlineText) => parseDate(deadlineText))
    .filter((deadline): deadline is { date: Date; formatted: string } => Boolean(deadline));
  const futureDeadlines = parsedDeadlines
    .filter((deadline) => deadline.date.getTime() >= todayStart.getTime())
    .sort((firstDeadline, secondDeadline) => firstDeadline.date.getTime() - secondDeadline.date.getTime());

  if (futureDeadlines[0]) {
    return futureDeadlines[0];
  }

  return parsedDeadlines.sort((firstDeadline, secondDeadline) => secondDeadline.date.getTime() - firstDeadline.date.getTime())[0] ?? null;
}

export function buildDeadlineStatus(deadlineInput: string | string[] | null): DeadlineStatusResult {
  const deadlines = Array.isArray(deadlineInput) ? deadlineInput : deadlineInput ? [deadlineInput] : [];
  const deadline = findRelevantDeadline(deadlines);

  if (!deadline) {
    return {
      status: "unknown",
      daysRemaining: null,
      deadlineMessage: "Срок не найден",
      deadline: null
    };
  }

  const diffInDays = Math.ceil((deadline.date.getTime() - getTodayStart().getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    const overdueDays = Math.abs(diffInDays);

    return {
      status: "overdue",
      daysRemaining: diffInDays,
      deadlineMessage: `Срок истёк ${overdueDays} ${getDayWord(overdueDays)} назад`,
      deadline: deadline.formatted
    };
  }

  if (diffInDays <= 3) {
    return {
      status: "urgent",
      daysRemaining: diffInDays,
      deadlineMessage: diffInDays === 0 ? "Срок сегодня" : `Осталось ${diffInDays} ${getDayWord(diffInDays)}`,
      deadline: deadline.formatted
    };
  }

  if (diffInDays <= 14) {
    return {
      status: "upcoming",
      daysRemaining: diffInDays,
      deadlineMessage: `Осталось ${diffInDays} ${getDayWord(diffInDays)}`,
      deadline: deadline.formatted
    };
  }

  return {
    status: "normal",
    daysRemaining: diffInDays,
    deadlineMessage: `Осталось ${diffInDays} ${getDayWord(diffInDays)}`,
    deadline: deadline.formatted
  };
}

function hasSoonDeadline(deadlines: string[]) {
  return deadlines.some((deadlineText) => isDeadlineSoon(parseDate(deadlineText)?.date ?? null));
}

function formatAmount(rawAmount: string) {
  const cleanedAmount = rawAmount.replace(/\s+/g, " ").trim();
  const numericPart = cleanedAmount.replace(/(?:€|eur|euro)/gi, "").trim();

  return `${numericPart} €`;
}

function detectAmount(sourceText: string) {
  const amountPattern = /\b\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s?(?:€|eur|euro)\b|\b\d+(?:,\d{2})?\s?(?:€|eur|euro)\b/gi;
  const match = sourceText.match(amountPattern);

  return match?.[0] ? formatAmount(match[0]) : null;
}

function cleanWebsite(value: string) {
  return value.replace(/[.,;:)\]]+$/g, "").trim();
}

function cleanPhone(value: string) {
  return value.replace(/\s+/g, " ").replace(/[.,;:]$/g, "").trim();
}

function isLikelyPhone(value: string) {
  const digitCount = value.replace(/\D/g, "").length;
  const trimmedValue = value.trim();
  const dateLikePattern = /^(?:\d{1,2}[./-]\d{1,2}[./-](?:\d{2}|\d{4})|\d{4}[./-]\d{1,2}[./-]\d{1,2})$/;

  return digitCount >= 7 && !dateLikePattern.test(trimmedValue);
}

export function detectContactData(sourceText: string): ContactData {
  const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const emails = unique((sourceText.match(emailPattern) ?? []).map((email) => email.toLowerCase()));
  const textWithoutEmails = sourceText.replace(emailPattern, " ");
  const phoneMatches = [
    ...Array.from(
      textWithoutEmails.matchAll(/\b(?:telefon|tel\.?|mobil|handy|phone|fax)\s*[:.]?\s*((?:\+|00)?\d[\d\s()./-]{5,}\d)/gi),
      (match) => match[1] ?? ""
    ),
    ...(textWithoutEmails.match(/\b(?:\+|00)\d[\d\s()./-]{5,}\d\b/g) ?? [])
  ];
  const phones = unique(phoneMatches.map(cleanPhone).filter(isLikelyPhone));
  const websitePattern =
    /\b(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9-]+\.)+(?:at|de|com|org|net|eu)\b(?:\/[^\s<>"']*)?/gi;
  const websites = unique(
    (textWithoutEmails.match(websitePattern) ?? [])
      .map(cleanWebsite)
      .filter((website) => website.length > 0)
  );

  return {
    emails,
    phones,
    websites
  };
}

function buildRecommendations(category: CaseCategory, riskLevel: RiskLevel, organization: string | null) {
  const recommendations = [...categoryRecommendations[category], ...riskRecommendations[riskLevel]];

  if (organization === "AMS") {
    return unique(["Проверить срок подачи документов.", "Подготовить Nachweis.", "Не пропустить Frist.", ...riskRecommendations[riskLevel]]);
  }

  return unique(recommendations);
}

export function determineCaseStatus(input: CaseStatusInput): CaseStatus {
  const hasDeadline = Boolean(input.deadline || input.deadlines.length > 0);
  const hasActionPlan = input.actionPlan.length > 0;

  if (input.riskLevel === "high" || (hasDeadline && input.riskLevel === "medium") || (hasActionPlan && input.riskLevel !== "low")) {
    return "action-required";
  }

  if (hasDeadline) {
    return "waiting";
  }

  if (hasActionPlan) {
    return "analyzed";
  }

  return "completed";
}

export function determinePriorityLevel(input: PrioritySummaryInput): PriorityLevel {
  const consequencesText = input.consequences.join(" ").toLowerCase();
  const hasCriticalConsequence =
    consequencesText.includes("прекращение выплаты") ||
    consequencesText.includes("инкассо") ||
    consequencesText.includes("штраф");

  if (input.documentType === "Kündigung" || hasCriticalConsequence || hasSoonDeadline(input.deadlines)) {
    return "critical";
  }

  if (
    input.deadlines.length > 0 ||
    input.documentType === "Mahnung" ||
    input.documentType === "Rechnung" ||
    input.documentType === "Dokumentenanforderung" ||
    input.requiredAction === "оплатить сумму" ||
    input.requiredAction === "предоставить документы" ||
    input.riskLevel === "high"
  ) {
    return "high";
  }

  if (
    input.documentType === "Termin" ||
    input.requiredAction === "явиться на термин" ||
    input.requiredAction === "подтвердить данные" ||
    input.riskLevel === "medium"
  ) {
    return "medium";
  }

  return "low";
}

export function buildPrioritySummary(input: PrioritySummaryInput) {
  const nearestDeadline = findNearestDeadline(input.deadlines)?.formatted ?? null;
  const documentLabel = input.documentType ? `Документ типа ${input.documentType}` : "Документ";
  const organizationText = input.organization ? ` от ${input.organization}` : "";
  const actionText = input.requiredAction ? ` требует: ${input.requiredAction}` : " не содержит явного срочного действия";
  const deadlineText = nearestDeadline ? ` до ${nearestDeadline}` : "";
  const amountText = input.amount ? ` Найдена сумма ${input.amount}.` : "";
  const consequenceText =
    input.consequences.length > 0
      ? ` При пропуске или ошибке возможно: ${input.consequences[0]}.`
      : " Главное последствие не найдено.";

  return `${documentLabel}${organizationText}${actionText}${deadlineText}.${amountText}${consequenceText}`;
}

export function createLocalAnalysis(sourceText: string): LocalAnalysis {
  const categoryResult = classifyCategory(sourceText);
  const riskResult = classifyRisk(sourceText);
  const organization = detectOrganization(sourceText);
  const deadlineEntries = detectDeadlineEntries(sourceText);
  const deadline = deadlineEntries[0] ?? detectDeadline(sourceText);
  const documentImportance = detectDocumentImportance(sourceText);
  const extractedData: ExtractedData = {
    documentType: documentImportance ?? detectDocumentType(sourceText),
    documentImportance,
    organization,
    caseNumber: detectCaseNumber(sourceText),
    requiredAction: detectRequiredAction(sourceText),
    deadline: deadline?.formatted ?? null,
    deadlines: deadlineEntries.map((deadlineEntry) => deadlineEntry.formatted),
    amount: detectAmount(sourceText),
    contacts: detectContactData(sourceText),
    consequences: detectConsequences(sourceText),
    isDeadlineSoon: deadlineEntries.some((deadlineEntry) => isDeadlineSoon(deadlineEntry.date))
  };
  const foundKeywords = unique([...categoryResult.foundKeywords, ...riskResult.foundKeywords]);
  const priorityInput: PrioritySummaryInput = {
    organization,
    documentType: extractedData.documentImportance ?? extractedData.documentType,
    requiredAction: extractedData.requiredAction,
    deadlines: extractedData.deadlines,
    amount: extractedData.amount,
    consequences: extractedData.consequences,
    riskLevel: riskResult.riskLevel
  };
  const priorityLevel = determinePriorityLevel(priorityInput);
  const deadlineStatusResult = buildDeadlineStatus(extractedData.deadlines.length > 0 ? extractedData.deadlines : extractedData.deadline);
  const actionPlan = buildActionPlan({
    riskLevel: riskResult.riskLevel,
    priorityLevel,
    deadlineStatus: deadlineStatusResult.status
  });
  const status = determineCaseStatus({
    deadline: extractedData.deadline,
    deadlines: extractedData.deadlines,
    riskLevel: riskResult.riskLevel,
    actionPlan
  });

  return {
    category: categoryResult.category,
    status,
    riskLevel: riskResult.riskLevel,
    foundKeywords,
    riskKeywords: riskResult.foundKeywords,
    riskReason: riskReasons[riskResult.riskLevel],
    explanation: `${riskReasons[riskResult.riskLevel]} Категория определена как "${categoryResult.category}".`,
    prioritySummary: buildPrioritySummary(priorityInput),
    priorityLevel,
    deadlineStatus: deadlineStatusResult.status,
    daysRemaining: deadlineStatusResult.daysRemaining,
    deadlineMessage: deadlineStatusResult.deadlineMessage,
    actionPlan,
    recommendedActions: actionPlan.length > 0 ? actionPlan : buildRecommendations(categoryResult.category, riskResult.riskLevel, organization),
    extractedData
  };
}
