import type { PendingPayment } from "./student.models";

const millisecondsPerDay = 86_400_000;
const reminderDays = 5;
type PaymentDue = Pick<PendingPayment, "dueOn" | "status" | "monthsOwed">;

export function pendingPaymentStatus(payment: PaymentDue, today: string): "overdue" | "upcoming" | "scheduled" {
  const todayAtMidnight = Date.parse(`${today}T00:00:00Z`);
  const dueAtMidnight = Date.parse(`${payment.dueOn}T00:00:00Z`);
  const daysUntilDue = (dueAtMidnight - todayAtMidnight) / millisecondsPerDay;
  if (!Number.isFinite(daysUntilDue)) {
    if (payment.status === "Adeudo" || payment.monthsOwed > 0) return "overdue";
    return "scheduled";
  }
  if (daysUntilDue < 0) return "overdue";
  return daysUntilDue <= reminderDays ? "upcoming" : "scheduled";
}

export function paymentAlerts(
  payments: readonly PaymentDue[],
  today: string,
): { overdue: boolean; upcoming: boolean } {
  const statuses = payments.map(payment => pendingPaymentStatus(payment, today));
  return { overdue: statuses.includes("overdue"), upcoming: statuses.includes("upcoming") };
}
