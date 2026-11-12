import assert from "node:assert/strict";
import test from "node:test";
import { paymentAlerts } from "../src/app/features/portal-alumno/domain/payment-alerts.ts";

const payment = { dueOn: "2026-11-14", status: "Próximo", monthsOwed: 0 };

test("activa el recordatorio cinco días antes y cuenta el día del vencimiento", () => {
  assert.deepEqual(paymentAlerts([payment], "2026-11-08"), { overdue: false, upcoming: false });
  assert.deepEqual(paymentAlerts([payment], "2026-11-09"), { overdue: false, upcoming: true });
  assert.deepEqual(paymentAlerts([payment], "2026-11-14"), { overdue: false, upcoming: true });
  assert.deepEqual(paymentAlerts([payment], "2026-11-15"), { overdue: true, upcoming: false });
});

test("permite mostrar adeudo y próximo pago a la vez y admite registros previos sin fecha", () => {
  const overduePayment = { status: "Adeudo", monthsOwed: 1 };
  assert.deepEqual(paymentAlerts([overduePayment, payment], "2026-11-11"), { overdue: true, upcoming: true });
  assert.deepEqual(paymentAlerts([], "2026-11-11"), { overdue: false, upcoming: false });
});
