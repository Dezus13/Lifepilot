import type { DeadlineStatus, PriorityLevel, RiskLevel } from "./analysis-rules";

export type ActionPlanInput = {
  riskLevel: RiskLevel;
  priorityLevel: PriorityLevel;
  deadlineStatus: DeadlineStatus;
};

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function buildDeadlineSteps(deadlineStatus: DeadlineStatus) {
  if (deadlineStatus === "overdue") {
    return [
      "Сразу проверить, какой срок уже прошел и есть ли возможность восстановить или объяснить пропуск.",
      "Не отправлять ответ автоматически: сначала сверить документ, дату и возможные последствия."
    ];
  }

  if (deadlineStatus === "urgent") {
    return [
      "Поставить срок как срочный и заняться кейсом сегодня.",
      "Подготовить короткий ответ или комплект документов до окончания срока."
    ];
  }

  if (deadlineStatus === "upcoming") {
    return [
      "Запланировать проверку кейса до ближайшего срока.",
      "Собрать недостающие документы или данные заранее."
    ];
  }

  if (deadlineStatus === "normal") {
    return [
      "Поставить напоминание о сроке и спокойно проверить требования.",
      "Подготовить ответ или документы без откладывания на последний день."
    ];
  }

  return [
    "Проверить, указан ли в документе срок ответа или действия.",
    "Если срок не найден, не считать кейс срочным только по тону текста."
  ];
}

function buildPrioritySteps(priorityLevel: PriorityLevel) {
  if (priorityLevel === "critical") {
    return [
      "Сначала проверить главное последствие и не принимать поспешных решений.",
      "Сохранить документ и все подтверждения перед любым ответом."
    ];
  }

  if (priorityLevel === "high") {
    return [
      "Проверить главное требование: оплата, документы, термин или ответ.",
      "Сверить суммы, номера дел и личные данные перед отправкой."
    ];
  }

  if (priorityLevel === "medium") {
    return [
      "Разобрать документ по фактам: кто пишет, что просит и какие данные нужны.",
      "Подготовить черновик ответа только после ручной проверки."
    ];
  }

  return [
    "Прочитать документ еще раз и отметить, требуется ли реальное действие.",
    "Сохранить кейс в истории, если он может понадобиться позже."
  ];
}

function buildRiskSteps(riskLevel: RiskLevel) {
  if (riskLevel === "high") {
    return [
      "При сомнении обратиться к специалисту или консультационной службе.",
      "Не признавать долг, вину или согласие с последствиями без проверки."
    ];
  }

  if (riskLevel === "medium") {
    return [
      "Перед ответом проверить сроки, суммы, адресата и список документов.",
      "Сохранить подтверждение отправки, если будете отвечать письменно."
    ];
  }

  return [
    "Проверить факты и сохранить исходный текст для истории.",
    "Отвечать нейтрально и без лишних обещаний, если ответ нужен."
  ];
}

export function buildActionPlan(input: ActionPlanInput) {
  return unique([
    ...buildDeadlineSteps(input.deadlineStatus),
    ...buildPrioritySteps(input.priorityLevel),
    ...buildRiskSteps(input.riskLevel)
  ]).slice(0, 5);
}
