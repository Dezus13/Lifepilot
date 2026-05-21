export type RiskLevel = "low" | "medium" | "high";
export type CaseCategory = "Жильё" | "Банк" | "Страховка" | "Госорган" | "Работа" | "Документы" | "Другое";

export type ExtractedData = {
  documentType: string | null;
  organization: string | null;
  requiredAction: string | null;
  deadline: string | null;
  amount: string | null;
  consequences: string[];
  isDeadlineSoon: boolean;
};

export type LocalAnalysis = {
  category: CaseCategory;
  riskLevel: RiskLevel;
  foundKeywords: string[];
  riskKeywords: string[];
  riskReason: string;
  explanation: string;
  recommendedActions: string[];
  extractedData: ExtractedData;
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
  { organization: "арендодатель", keywords: ["vermieter"] },
  { organization: "страховая", keywords: ["versicherung", "polizze"] },
  { organization: "кооператив", keywords: ["genossenschaft"] },
  { organization: "госорган", keywords: ["behörde", "amt"] },
  { organization: "работодатель", keywords: ["dienstgeber"] }
];

const documentTypeRules: Array<{
  documentType: string;
  keywords: string[];
}> = [
  { documentType: "Mahnung", keywords: ["mahnung"] },
  { documentType: "Rechnung", keywords: ["rechnung"] },
  { documentType: "Kündigung", keywords: ["kündigung"] },
  { documentType: "Informationsschreiben", keywords: ["informationsschreiben", "information", "mitteilung"] },
  { documentType: "Anforderung von Unterlagen", keywords: ["anforderung von unterlagen", "anforderung", "unterlagen"] },
  { documentType: "Terminmitteilung", keywords: ["terminmitteilung", "termin"] }
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

function detectDocumentType(sourceText: string) {
  const matchedRule = documentTypeRules.find((rule) => findKeywords(sourceText, rule.keywords).length > 0);

  return matchedRule?.documentType ?? null;
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

function detectDeadline(sourceText: string) {
  const datePattern = /\b\d{1,2}[./-]\d{1,2}[./-](?:\d{2}|\d{4})\b/g;
  const dates = sourceText.match(datePattern) ?? [];

  for (const dateText of dates) {
    const parsedDate = parseDate(dateText);

    if (parsedDate) {
      return parsedDate;
    }
  }

  return null;
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

function buildRecommendations(category: CaseCategory, riskLevel: RiskLevel, organization: string | null) {
  const recommendations = [...categoryRecommendations[category], ...riskRecommendations[riskLevel]];

  if (organization === "AMS") {
    return unique(["Проверить срок подачи документов.", "Подготовить Nachweis.", "Не пропустить Frist.", ...riskRecommendations[riskLevel]]);
  }

  return unique(recommendations);
}

export function createLocalAnalysis(sourceText: string): LocalAnalysis {
  const categoryResult = classifyCategory(sourceText);
  const riskResult = classifyRisk(sourceText);
  const organization = detectOrganization(sourceText);
  const deadline = detectDeadline(sourceText);
  const extractedData: ExtractedData = {
    documentType: detectDocumentType(sourceText),
    organization,
    requiredAction: detectRequiredAction(sourceText),
    deadline: deadline?.formatted ?? null,
    amount: detectAmount(sourceText),
    consequences: detectConsequences(sourceText),
    isDeadlineSoon: isDeadlineSoon(deadline?.date ?? null)
  };
  const foundKeywords = unique([...categoryResult.foundKeywords, ...riskResult.foundKeywords]);

  return {
    category: categoryResult.category,
    riskLevel: riskResult.riskLevel,
    foundKeywords,
    riskKeywords: riskResult.foundKeywords,
    riskReason: riskReasons[riskResult.riskLevel],
    explanation: `${riskReasons[riskResult.riskLevel]} Категория определена как "${categoryResult.category}".`,
    recommendedActions: buildRecommendations(categoryResult.category, riskResult.riskLevel, organization),
    extractedData
  };
}
