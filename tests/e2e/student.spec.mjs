import { expect, test } from "@playwright/test";

test("conserva cursos, filtros y detalle en una ruta que se puede recargar", async ({
  page,
}) => {
  await page.goto("/portal-alumno");
  await expect(page.getByRole("heading", { name: /Bienvenido/ })).toBeVisible();
  await page.getByRole("button", { name: "Cursos", exact: true }).click();
  await page.getByRole("button", { name: "Actuales", exact: true }).click();
  await page.locator("main input").fill("Tarot");
  await page
    .getByText("Tarot Evolutivo y Terapéutico", { exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Acerca de la actividad" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/portal-alumno\/cursos-actuales\/\d+$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Acerca de la actividad" })).toBeVisible();
});

test("mantiene calendario, pagos y perfil de maestro", async ({ page }) => {
  await page.goto("/portal-alumno");
  await page.getByRole("button", { name: "Actividades del mes" }).click();
  await page.getByRole("button", { name: "Vista de Calendario" }).click();
  await expect(
    page.getByText("Magia Herbolaria Aplicada", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pagos", exact: true }).click();
  await expect(
    page.getByText("Historial de Pagos", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Maestros", exact: true }).click();
  await page.getByText("Erin Ahra", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Semblanza" })).toBeVisible();
});

test("mantiene la barra lateral adaptable y las notificaciones", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/portal-alumno");
  const sidebar = page.locator("aside");
  await expect(sidebar).toHaveCSS("width", "288px");
  await expect(page.locator("h1")).toHaveCSS("font-size", "24px");
  await page.getByRole("button", { name: "Notificaciones" }).click();
  await expect(page.getByText("Nuevo ritual añadido")).toBeVisible();
  await page.locator("h1").click();
  await expect(
    page
      .getByText("Nuevo ritual añadido")
      .locator('xpath=ancestor::div[contains(@class,"origin-top-right")][1]'),
  ).toHaveCSS("opacity", "0");
  await page.setViewportSize({ width: 679, height: 804 });
  await expect.poll(async () => (await sidebar.boundingBox()).x).toBe(-288);
  await expect(page.locator("main")).toHaveCSS("width", "679px");
});

test("mantiene un solo submenú abierto y resalta la vista activa", async ({
  page,
}) => {
  await page.goto("/portal-alumno");
  const courses = page.getByRole("button", { name: "Cursos", exact: true });
  const monthly = page.getByRole("button", {
    name: "Actividades del mes",
    exact: true,
  });
  await courses.click();
  await page.getByRole("button", { name: "Actuales", exact: true }).click();
  await expect(page.locator("nav [aria-current=page]")).toHaveText("Actuales");
  await monthly.click();
  await expect(courses).toHaveAttribute("aria-expanded", "false");
  await expect(monthly).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Servicios", exact: true }).click();
  await expect(page.locator("nav [aria-current=page]")).toHaveText("Servicios");
  await courses.click();
  await expect(monthly).toHaveAttribute("aria-expanded", "false");
  await expect(courses).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("nav [aria-current=page]")).toHaveText(
    "Actividades del mes",
  );
});

test("permite navegar y leer el encabezado en pantallas estrechas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 680 });
  await page.goto("/portal-alumno");
  const logo = page.getByRole("img", {
    name: "Círculo de Brujas",
    exact: true,
  });
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((img) => img.naturalWidth))
    .toBeGreaterThan(0);
  const menu = page.getByRole("button", { name: "Abrir menú" });
  await menu.click();
  await page
    .getByRole("button", { name: "Actividades del mes", exact: true })
    .click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Curso", exact: true }).click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("heading", { name: "Cursos del Mes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Notificaciones" }).click();
  const popover = page
    .getByText("Nuevo ritual añadido")
    .locator('xpath=ancestor::div[contains(@class,"origin-top-right")][1]');
  await expect(popover).toHaveCSS("opacity", "1");
  const bounds = await popover.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Cursos del Mes" }),
  ).toBeVisible();
});
