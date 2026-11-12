import { expect, test } from "@playwright/test";

test("Inicio recomienda tres cursos y conecta la próxima actividad, los cursos activos y los pagos", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-11T18:00:00Z"));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/portal-alumno");

  const recommended = page.getByRole("region", { name: "Te podría interesar" });
  const next = page.getByRole("region", { name: "Tu próxima actividad" });
  await expect(recommended.getByRole("img")).toHaveCount(3);
  await expect(recommended.getByRole("link", { name: /Arcanos Mayores.*Relacionado/ }))
    .toHaveAttribute("href", "/portal-alumno/actividades-mes/211");
  await expect(recommended.getByRole("link", { name: /Fundamentos de Magia Natural.*Nuevo en el catálogo/ }))
    .toHaveAttribute("href", "/portal-alumno/actividades-mes/212");
  await expect(recommended.getByRole("link", { name: /Defensa Energética.*Para tu nivel/ }))
    .toHaveAttribute("href", "/portal-alumno/actividades-mes/204");
  await expect(next.getByRole("heading", { name: "Magia Herbolaria Aplicada" })).toBeVisible();
  await expect(page.getByText("Próximos Talleres", { exact: true })).toHaveCount(0);

  await next.getByRole("link", { name: "Ver actividad" }).click();
  await expect(page).toHaveURL("/portal-alumno/actividades-mes/201");
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(page).toHaveURL("/portal-alumno");
  await recommended.getByRole("img", { name: "Arcanos Mayores en la práctica" }).click();
  await expect(page).toHaveURL("/portal-alumno/actividades-mes/211");
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(page).toHaveURL("/portal-alumno");

  await page.getByRole("link", { name: "Cursos Activos 4" }).click();
  await expect(page).toHaveURL("/portal-alumno/cursos-actuales?estado=activo");
  await expect(page.getByRole("heading", { name: "Tus cursos activos" })).toBeVisible();
  await expect(page.locator("student-cursos-actuales").getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(page.getByText("Magia Herbolaria Aplicada", { exact: true })).toHaveCount(0);
  await page.getByText("Tarot Evolutivo y Terapéutico", { exact: true }).click();
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(page).toHaveURL("/portal-alumno/cursos-actuales?estado=activo");
  const backToHome = page.getByRole("link", { name: "Volver a Inicio" });
  await backToHome.click();
  await expect(page).toHaveURL("/portal-alumno");
  const payments = page.getByRole("link", { name: /Estado de Pagos/ });
  await expect(payments.getByText("Adeudo", { exact: true })).toBeVisible();
  await expect(payments.getByText("Próximo pago", { exact: true })).toBeVisible();
  await payments.click();
  await expect(page.getByRole("heading", { name: "Estado de Cuenta y Pagos" })).toBeVisible();
  const dues = page.getByRole("region", { name: "Cuotas pendientes" });
  await expect(dues.getByRole("heading", { name: "Adeudo", exact: true })).toBeVisible();
  await expect(dues.getByRole("heading", { name: "Próximo pago", exact: true })).toBeVisible();
  await expect(dues.getByText("Pago en línea aún no disponible.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pagar ahora" })).toHaveCount(0);
  await backToHome.click();
  await expect(page).toHaveURL("/portal-alumno");

  await page.setViewportSize({ width: 390, height: 844 });
  expect((await next.boundingBox()).y).toBeLessThan((await recommended.boundingBox()).y);
  await page.clock.setFixedTime(new Date("2026-11-12T17:00:00Z"));
  await page.reload();
  await expect(next.getByRole("heading", { name: "Astrología Kármica y Nodos Lunares" })).toBeVisible();
  await page.clock.setFixedTime(new Date("2026-12-01T18:00:00Z"));
  await page.reload();
  await expect(next).toContainText("Aún no hay actividades próximas en la agenda.");
  await page.clock.setFixedTime(new Date("2026-10-31T18:00:00Z"));
  await page.reload();
  await expect(payments.getByText("Al corriente", { exact: true })).toBeVisible();
  await page.clock.setFixedTime(new Date("2026-11-15T18:00:00Z"));
  await page.goto("/portal-alumno/pagos");
  await expect(dues.getByRole("heading", { name: "Adeudo", exact: true })).toHaveCount(2);
  await expect(dues.getByRole("heading", { name: "Próximo pago", exact: true })).toHaveCount(0);
});

test("conserva cursos, filtros y detalle en una ruta que se puede recargar", async ({
  page,
}) => {
  await page.goto("/portal-alumno");
  await expect(page.getByRole("heading", { name: /Qué gusto verte de nuevo/ })).toBeVisible();
  await page.getByRole("button", { name: "Cursos", exact: true }).click();
  await page.getByRole("button", { name: "Actuales", exact: true }).click();
  await page.locator("main input").fill("Tarot");
  const tarot = page.getByRole("link", { name: "Tarot Evolutivo y Terapéutico", exact: true });
  await tarot.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Acerca de la actividad" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/portal-alumno\/cursos-actuales\/\d+$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Acerca de la actividad" })).toBeVisible();
  await expect(page.getByText("Martes y Jueves, 18:00 PM", { exact: false })).toBeVisible();
});

test("muestra los datos propios de la actividad al abrirla desde el calendario", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-11-11T18:00:00Z"));
  await page.goto("/portal-alumno/actividades-mes");
  await page.getByRole("button", { name: "Vista de Calendario" }).click();
  await page.getByText("Astrología Kármica y Nodos Lunares", { exact: true }).click();
  await expect(page.getByText(/Sesión grupal para entender las misiones del alma/)).toBeVisible();
  await expect(page.getByText(/Modalidad:\s*En línea/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Qué Aprenderás?" })).toHaveCount(0);
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(page).toHaveURL(/\/portal-alumno\/actividades-mes$/);

  await page.goto("/portal-alumno/actividades-mes/207");
  await expect(page.getByRole("heading", { name: /Kali/ })).toBeVisible();
  await expect(page.getByText("Lugar:", { exact: true })).toHaveCount(0);
});

test("resalta el día seleccionado y muestra su agenda debajo del calendario", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-11T18:00:00Z"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portal-alumno/actividades-mes");
  await page.getByRole("button", { name: "Vista de Calendario" }).click();
  await expect(page.getByRole("heading", { name: "Actividades de Noviembre 2026" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver diciembre" })).toHaveCount(0);

  const day12 = page.getByRole("button", { name: "12 de noviembre", exact: true });
  const day13 = page.getByRole("button", { name: "13 de noviembre", exact: true });
  const calendar = page.locator(".month-calendar");
  const saturday = page.getByRole("button", { name: "28 de noviembre", exact: true });
  const sunday = page.getByRole("button", { name: "29 de noviembre", exact: true });
  await expect(saturday).toBeInViewport({ ratio: 1 });
  await expect(sunday).toBeInViewport({ ratio: 1 });
  await expect(saturday).toHaveAccessibleDescription("1 actividad");
  await expect(saturday.locator(".month-dot")).toBeVisible();
  expect(await calendar.evaluate(element => element.scrollWidth)).toBe(
    await calendar.evaluate(element => element.clientWidth),
  );
  const dateNumber = day12.getByText("12", { exact: true });
  await dateNumber.click();
  await expect(day12).toHaveAttribute("aria-pressed", "true");
  await expect(dateNumber).toHaveCSS("background-color", "rgb(111, 81, 111)");
  const agenda = page.getByRole("region", { name: "Actividades del 12 de noviembre" });
  await expect(agenda.getByRole("heading", { level: 2 })).toBeInViewport({ ratio: 1 });
  const portalContent = page.locator("main div:has(> router-outlet)");
  await expect.poll(() => portalContent.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  const cards = agenda.getByRole("article");
  await expect(cards).toHaveCount(2);
  await expect(agenda.getByRole("img", { name: /^Cartel de / })).toHaveCount(2);
  await expect(agenda.getByText("Magia Herbolaria Aplicada")).toBeVisible();
  await agenda.getByRole("link", { name: /Astrología Kármica/ }).press("Enter");
  await expect(page).toHaveURL("/portal-alumno/actividades-mes/202");
  await expect.poll(() => portalContent.evaluate(element => element.scrollTop)).toBe(0);
  await expect(page.getByRole("heading", { name: "Astrología Kármica y Nodos Lunares", exact: true }))
    .toBeInViewport({ ratio: 1 });
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(agenda).toBeVisible();
  await expect(day12).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => portalContent.evaluate(element => element.scrollTop)).toBe(0);

  await agenda.getByRole("link", { name: "Diana Lunar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sobre Diana Lunar" })).toBeInViewport({ ratio: 1 });
  await expect.poll(() => portalContent.evaluate(element => element.scrollTop)).toBe(0);
  await page.getByRole("button", { name: "Volver", exact: true }).click();
  await expect(cards).toHaveCount(2);

  await day13.focus();
  await day13.press("Enter");
  await expect(day12).toHaveAttribute("aria-pressed", "false");
  await expect(day13).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Actividades del 13 de noviembre" }))
    .toContainText("No hay actividades para este día.");
});

for (const [activityId, teacherId, name] of [
  [206, 8, "Itah"],
  [207, 9, "Nadia Vesper"],
  [208, 10, "Annia"],
  [209, 11, "Krabat"],
  [210, 12, "Irene Tinta"],
]) {
  test(`abre el perfil y el retrato de ${name} desde su actividad`, async ({ page }) => {
    const activity = `/portal-alumno/actividades-mes/${activityId}`;
    await page.goto(activity);
    await page.getByText(name, { exact: true }).click();
    await expect(page).toHaveURL(`/portal-alumno/maestros/${teacherId}`);
    await expect(page.getByRole("heading", { name: `Sobre ${name}` })).toBeVisible();
    await expect(page.getByText("Perfil de demostración con semblanza y retrato ficticios.")).toBeVisible();
    const portrait = page.getByRole("complementary", { name: "Perfil del maestro" }).locator("img");
    await expect.poll(() => portrait.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Volver", exact: true }).click();
    await expect(page).toHaveURL(activity);
  });
}

for (const { section, id, instructor, title } of [
  { section: "cursos-actuales", id: 1, instructor: "Erin Ahra", title: "Tarot Evolutivo y Terapéutico" },
  { section: "cursos-pasados", id: 3, instructor: "Solange Astral", title: "Lectura de Tarot Anual" },
  { section: "actividades-mes", id: 201, instructor: "Diana Lunar", title: "Magia Herbolaria Aplicada" },
]) {
  test(`vuelve desde el perfil del maestro a ${title}`, async ({ page }) => {
    const origin = `/portal-alumno/${section}/${id}`;
    await page.goto(origin);
    await page.getByText(instructor, { exact: true }).click();
    await expect(page).toHaveURL(/\/portal-alumno\/maestros\/\d+$/);
    await expect(page.getByRole("heading", { name: "Semblanza" })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Volver", exact: true }).click();
    await expect(page).toHaveURL(origin);
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  });
}

test("mantiene calendario, pagos y perfil de maestro", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-11T18:00:00Z"));
  await page.setViewportSize({ width: 1024, height: 600 });
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
  const portalContent = page.locator("main div:has(> router-outlet)");
  await portalContent.evaluate(element => element.scrollTo(0, element.scrollHeight));
  await expect.poll(() => portalContent.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Maestros", exact: true }).click();
  await expect.poll(() => portalContent.evaluate(element => element.scrollTop)).toBe(0);
  const portrait = page.getByRole("img", { name: "Erin Ahra", exact: true }).locator("..");
  await expect(portrait).toHaveCSS("width", "176px");
  await page.setViewportSize({ width: 768, height: 600 });
  const dimensions = await portrait.evaluate(element => ({
    width: element.offsetWidth,
    height: element.offsetHeight,
    cardWidth: element.parentElement.clientWidth,
  }));
  expect(dimensions.width).toBe(dimensions.height);
  expect(dimensions.width).toBeLessThan(dimensions.cardWidth);
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.getByText("Erin Ahra", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Semblanza" })).toBeVisible();
  const profilePhoto = page.getByRole("complementary", { name: "Perfil del maestro" }).locator("img");
  await expect(profilePhoto).toHaveCSS("width", "224px");
  await expect(profilePhoto).toHaveCSS("height", "224px");
  await page.getByRole("button", { name: "Todos los maestros", exact: true }).click();
  await expect(page).toHaveURL(/\/portal-alumno\/maestros$/);
});

test("muestra la oferta del maestro en cuadrícula y permite volver desde cada ficha", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-12-01T05:59:00Z") });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/portal-alumno/maestros/1");
  const section = page.getByRole("region", { name: "Sus actividades de Noviembre 2026" });
  const ongoing = page.getByRole("region", { name: "Cursos en curso" });
  const grid = section.locator(".grid");
  await expect(section.getByRole("link")).toHaveCount(1);
  await expect(ongoing.getByRole("link")).toHaveCount(2);
  await expect.poll(() => grid.evaluate(element =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  )).toBe(3);
  await expect(section.getByText("Historia de la Magia")).toHaveCount(0);
  await expect(section.getByText("Magia Herbolaria Aplicada")).toHaveCount(0);

  for (const [group, name, url] of [
    [ongoing, "Tarot Evolutivo y Terapéutico", "/portal-alumno/cursos-actuales/1"],
    [section, "Defensa Energética (Inicio)", "/portal-alumno/actividades-mes/204"],
  ]) {
    await group.getByRole("link").filter({
      has: page.getByRole("heading", { name, exact: true }),
    }).click();
    await expect(page).toHaveURL(url);
    await page.getByRole("button", { name: "Volver", exact: true }).click();
    await expect(page).toHaveURL("/portal-alumno/maestros/1");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => grid.evaluate(element =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  )).toBe(1);
  await page.clock.fastForward(60_000);
  const december = page.getByRole("region", { name: "Sus actividades de Diciembre 2026" });
  await expect(december).toContainText("Este perfil no tiene actividades programadas para este mes.");
  await expect(december.getByRole("link")).toHaveCount(0);
  await expect(ongoing.getByRole("link")).toHaveCount(2);
});

test("alterna la vista de maestros junto al buscador y conserva la selección al volver", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/portal-alumno/maestros");
  const directory = page.locator("student-maestros");
  const search = directory.getByRole("textbox", { name: "Buscar maestros" });
  const selector = directory.getByRole("group", { name: "Vista del directorio" });
  const compact = selector.getByRole("button", { name: "Foto y nombre" });
  const full = selector.getByRole("button", { name: "Vista completa" });
  const photos = directory.getByRole("img");
  const nextPage = directory.getByRole("button", { name: "Siguiente" });
  await expect(full).toHaveAttribute("aria-pressed", "true");
  await expect(photos).toHaveCount(6);
  await expect(nextPage).toBeVisible();
  await compact.click();
  await expect(photos).toHaveCount(12);
  await expect(nextPage).toHaveCount(0);
  const rows = await photos.evaluateAll((images) =>
    images.map((image) => image.getBoundingClientRect().top),
  );
  expect(rows.slice(0, 6)).toEqual(Array(6).fill(rows[0]));
  expect(rows.slice(6)).toEqual(Array(6).fill(rows[6]));
  expect(rows[6]).toBeGreaterThan(rows[0]);

  await page.setViewportSize({ width: 390, height: 844 });
  const selectorBox = await selector.boundingBox();
  const searchBox = await search.boundingBox();
  expect(selectorBox.x + selectorBox.width).toBeLessThanOrEqual(searchBox.x);
  await expect(photos).toHaveCount(12);

  await full.click();
  await search.fill("Erin");
  await expect(directory.getByText("Directora", { exact: true })).toBeVisible();
  await compact.click();
  await expect(compact).toHaveAttribute("aria-pressed", "true");
  await expect(search).toHaveValue("Erin");
  await expect(directory.getByRole("img")).toHaveCount(1);
  await expect(directory.getByRole("heading", { name: "Erin Ahra" })).toBeVisible();
  await expect(directory.getByText("Directora", { exact: true })).toHaveCount(0);
  await expect(directory.getByText("Herbolaria Oculta", { exact: true })).toHaveCount(0);
  await directory.getByRole("img", { name: "Erin Ahra" }).click();
  await expect(page.getByRole("heading", { name: "Sobre Erin Ahra" })).toBeVisible();

  await page.getByRole("button", { name: "Todos los maestros" }).click();
  await expect(compact).toHaveAttribute("aria-pressed", "true");
  await full.click();
  await expect(full).toHaveAttribute("aria-pressed", "true");
  await expect(directory.getByText("Directora", { exact: true })).toBeVisible();
});

test("mantiene la barra lateral adaptable y las notificaciones", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/portal-alumno");
  const sidebar = page.locator("aside");
  await expect(sidebar).toHaveCSS("width", "288px");
  const avatar = sidebar.locator("student-avatar");
  await expect(avatar).toHaveCSS("width", "96px");
  await page.getByTitle("Colapsar menú", { exact: true }).click();
  await expect(avatar).toHaveCSS("width", "40px");
  await page.getByTitle("Expandir menú", { exact: true }).click();
  await expect(page.locator("h1")).toHaveCSS("font-size", "24px");
  await page.getByRole("button", { name: "Notificaciones" }).click();
  await expect(page.getByText("Nuevo ritual añadido")).toBeVisible();
  await page.locator("h1").click();
  await expect(page.locator("#portal-notifications")).toBeHidden();
  const notifications = page.getByRole("button", { name: "Notificaciones" });
  await notifications.click();
  await expect(notifications).toHaveAccessibleDescription("2 sin leer");
  await page.keyboard.press("Escape");
  await expect(notifications).toBeFocused();
  await expect(page.locator("#portal-notifications")).toBeHidden();
  await notifications.press("Enter");
  await page.getByRole("link", { name: /Nuevo ritual añadido/ }).press("Enter");
  await expect(page).toHaveURL("/portal-alumno/actividades-mes/203");
  await expect(notifications).toHaveAccessibleDescription("1 sin leer");
  await page.reload();
  await expect(notifications).toHaveAccessibleDescription("1 sin leer");
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
  await page.clock.setFixedTime(new Date("2026-11-11T18:00:00Z"));
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
  const menu = page.locator('button[aria-controls="portal-menu"]');
  await menu.click();
  await expect(page.getByRole("button", { name: "Cerrar menú", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator("#portal-menu")).toHaveAttribute("inert", "");
  await menu.press("Enter");
  await page
    .getByRole("button", { name: "Actividades del mes", exact: true })
    .click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Curso", exact: true }).click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("heading", { name: "Cursos de Noviembre 2026" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Notificaciones" }).click();
  const popover = page.locator("#portal-notifications");
  await expect(popover).toBeVisible();
  const bounds = await popover.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Cursos de Noviembre 2026" }),
  ).toBeVisible();
});
