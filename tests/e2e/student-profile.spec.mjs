import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

test("abre el reglamento en otra pestaña y conserva el formulario de Configuración", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portal-alumno/configuracion");

  const photo = page.getByRole("region", { name: "Foto de perfil" });
  const rules = page.getByRole("link", { name: /Reglamento del alumno/ });
  const photoBox = await photo.boundingBox();
  const rulesBox = await rules.boundingBox();
  expect(rulesBox.y).toBeGreaterThanOrEqual(photoBox.y + photoBox.height);

  const name = page.getByRole("textbox", { name: "Nombre mágico" });
  await name.fill("Nombre aún por guardar");
  const url = new URL(await rules.getAttribute("href"), await page.evaluate(() => document.baseURI));
  const pdf = await context.request.get(url.href);
  expect(pdf.ok()).toBe(true);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");

  const [reader] = await Promise.all([context.waitForEvent("page"), rules.click()]);
  await expect(reader).toHaveURL(url.href);
  await expect(page).toHaveURL("/portal-alumno/configuracion");
  await expect(name).toHaveValue("Nombre aún por guardar");
});

test("cambia el tema junto a Configuración y conserva la preferencia al recargar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portal-alumno/configuracion");
  const portal = page.locator("cb-portal");
  const menu = portal.locator("aside");
  const theme = menu.getByRole("button", { name: "Modo oscuro" });
  const settings = menu.getByRole("link", { name: "Configuración" });
  const panel = page.getByRole("region", { name: "Datos del alumno" });
  const logo = page.getByRole("link", { name: "Círculo de Brujas, ir al inicio" }).locator("img");

  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(theme).toBeInViewport();
  await expect(theme).toHaveAttribute("aria-pressed", "false");
  await expect(settings).toBeVisible();
  expect(await theme.evaluate(button =>
    button.getBoundingClientRect().left >= button.previousElementSibling.getBoundingClientRect().right,
  )).toBe(true);
  await theme.click();
  await expect(theme).toHaveAttribute("aria-pressed", "true");
  await expect(menu).toHaveCSS("background-color", "rgb(31, 27, 36)");
  await page.getByRole("button", { name: "Cerrar menú" }).click();
  await expect(logo).toHaveCSS("filter", "invert(1) hue-rotate(180deg)");
  await expect(logo).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(panel).toHaveCSS("background-color", "rgb(31, 27, 36)");
  await expect(panel.getByRole("heading", { name: "Datos del alumno" })).toHaveCSS("color", "rgb(246, 239, 249)");

  await page.reload();
  await expect(portal).toHaveAttribute("data-theme", "dark");
  await page.goto("/portal-alumno/maestros");
  await expect(page.getByRole("img", { name: "Erin Ahra" }).locator("../.."))
    .toHaveCSS("background-color", "rgb(39, 34, 46)");
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(253, 252, 250)");

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/portal-alumno/configuracion");
  await page.getByTitle("Colapsar menú", { exact: true }).click();
  await expect(theme).toBeInViewport();
  await theme.click();
  await expect(theme).toHaveAttribute("aria-pressed", "false");
  await expect(logo).toHaveCSS("filter", "none");
  await expect(panel).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("guarda el nombre elegido y mantiene los datos de inscripción de solo lectura", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portal-alumno");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Configuración" }).click();
  await expect(page).toHaveURL("/portal-alumno/configuracion");
  await expect(page.getByRole("heading", { name: "Configuración" })).toBeInViewport();
  const details = page.getByRole("region", { name: "Datos del alumno" });

  for (const [label, value] of [
    ["Nombre", "Mariana Dayami Oliva Ramos"],
    ["Matrícula", "10293847"],
    ["Nivel", "Principiante"],
  ]) {
    const field = details.getByRole("textbox", { name: label, exact: true });
    await expect(field).toHaveValue(value);
    await expect(field).toBeDisabled();
  }

  const name = page.getByRole("textbox", { name: "Nombre mágico" });
  const magical = page.getByRole("radio", { name: "Nombre mágico" });
  const legal = page.getByRole("radio", { name: "Nombre", exact: true });
  const save = page.getByRole("button", { name: "Guardar cambio" });
  await expect(save).toBeHidden();
  await magical.check();
  await expect(save).toBeVisible();
  await legal.check();
  await expect(save).toBeHidden();
  await magical.check();
  await save.click();
  await expect(page.getByRole("alert")).toContainText("Escribe un nombre mágico");
  await name.fill("  Luna de Tinta  ");
  await save.click();
  await expect(page.getByRole("status")).toHaveText("Cambio guardado.");
  await expect(save).toBeHidden();
  await expect(name).toBeDisabled();
  await page.reload();
  await expect(name).toHaveValue("Luna de Tinta");
  await expect(name).toBeDisabled();
  await name.evaluate(element => element.focus());
  await expect(name).not.toBeFocused();
  const editName = details.getByRole("button", { name: "Editar nombre mágico" });
  const fieldBox = await name.boundingBox();
  const iconBox = await editName.boundingBox();
  expect(iconBox.x).toBeGreaterThan(fieldBox.x);
  expect(iconBox.x + iconBox.width).toBeLessThanOrEqual(fieldBox.x + fieldBox.width);
  await editName.click();
  await expect(name).toBeEditable();
  await expect(name).toBeFocused();
  await expect(save).toBeHidden();
  await name.fill("Luna de Papel");
  await expect(save).toBeVisible();
  await name.fill("Luna de Tinta");
  await expect(save).toBeHidden();
  await expect(magical).toBeChecked();
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.locator("aside").getByRole("heading", { name: "Luna de Tinta" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar menú" }).click();
  await page.goto("/portal-alumno");
  await expect(page.getByRole("heading", { name: "Qué gusto verte de nuevo, Luna de Tinta" })).toBeVisible();

  await page.goto("/portal-alumno/configuracion");
  await legal.check();
  await save.click();
  await page.goto("/portal-alumno");
  await expect(page.getByRole("heading", { name: "Qué gusto verte de nuevo, Mariana Dayami Oliva Ramos" })).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/portal-alumno/configuracion");
  const title = await page.getByRole("heading", { name: "Configuración" }).boundingBox();
  const photoPanel = await page.getByRole("region", { name: "Foto de perfil" }).boundingBox();
  const dataPanel = await details.boundingBox();
  expect(title.x).toBeCloseTo(photoPanel.x);
  expect(dataPanel.y).toBeCloseTo(photoPanel.y);
  expect(dataPanel.x).toBeGreaterThanOrEqual(photoPanel.x + photoPanel.width);
});

test("recorta la foto y la guarda únicamente después de confirmar", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    const key = "circulo-de-brujas:student-profile:10293847";
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({ magicalName: "", displayName: "legal", photo: null }));
    }
  });
  await page.goto("/portal-alumno/configuracion");
  const photoPanel = page.getByRole("region", { name: "Foto de perfil" });
  const avatar = photoPanel.locator("student-avatar");
  await expect(avatar).toHaveCSS("width", "224px");
  await expect(avatar).toHaveCSS("height", "224px");
  const placeholder = photoPanel.getByRole("img", { name: "Avatar predeterminado" });
  await expect(placeholder).toBeVisible();

  await photoPanel.getByRole("button", { name: "Editar foto" }).click();
  const editor = page.getByRole("dialog", { name: "Ajustar foto de perfil" });
  await expect(editor.getByRole("button", { name: "Elegir foto" })).toBeVisible();
  const savePhoto = editor.getByRole("button", { name: "Guardar foto", exact: true });
  await expect(savePhoto).toHaveCount(0);
  const fileInput = editor.getByLabel("Archivo de foto de perfil");
  await fileInput.setInputFiles({
    name: "archivo.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("sin imagen"),
  });
  await expect(editor.getByRole("alert")).toContainText("Elige una imagen");
  await fileInput.setInputFiles(fileURLToPath(new URL("../../src/assets/profiles/gaby.jpeg", import.meta.url)));

  await expect(editor).toBeVisible();
  const bounds = editor.getByRole("group", { name: "Encuadre de la foto" });
  const guide = bounds.locator(".crop-guide");
  await expect(guide).toHaveCSS("border-top-left-radius", "50%");
  const preview = bounds.locator("img");
  const zoom = editor.getByRole("slider", { name: "Zoom" });
  await zoom.press("Home");
  expect(Number(await zoom.inputValue())).toBeLessThan(1);
  const fullPhoto = await preview.boundingBox();
  const stage = await bounds.boundingBox();
  expect(fullPhoto.x).toBeGreaterThanOrEqual(stage.x);
  expect(fullPhoto.y).toBeGreaterThanOrEqual(stage.y);
  expect(fullPhoto.x + fullPhoto.width).toBeLessThanOrEqual(stage.x + stage.width);
  expect(fullPhoto.y + fullPhoto.height).toBeLessThanOrEqual(stage.y + stage.height);
  await zoom.press("End");
  await expect(zoom).toHaveValue("3");
  const before = await guide.evaluate(element => parseFloat(element.style.left));
  const fixedPhoto = await preview.boundingBox();
  await bounds.press("ArrowLeft");
  await expect.poll(() => guide.evaluate(element => parseFloat(element.style.left))).toBeLessThan(before);
  const cropBox = await bounds.boundingBox();
  await page.mouse.move(cropBox.x + cropBox.width / 2, cropBox.y + cropBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(cropBox.x + cropBox.width / 2 + 20, cropBox.y + cropBox.height / 2);
  await page.mouse.up();
  await expect.poll(() => guide.evaluate(element => parseFloat(element.style.left))).toBeGreaterThan(before);
  expect(await preview.boundingBox()).toEqual(fixedPhoto);
  const savedPosition = await guide.evaluate(element => element.style.left);

  await savePhoto.click();
  const confirmation = page.getByRole("dialog", { name: "¿Estás segura de cambiar la foto de perfil?" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "Seguir editando" }).click();
  await expect(editor).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("circulo-de-brujas:student-profile:10293847")).photo))
    .toBeNull();
  await savePhoto.click();
  await confirmation.getByRole("button", { name: "Sí, cambiar foto" }).click();
  await expect(page.getByRole("status")).toHaveText("Foto de perfil actualizada.");
  const photo = photoPanel.getByRole("img", { name: "Foto de perfil" });
  await expect.poll(() => photo.evaluate(image => image.naturalWidth)).toBe(512);
  const source = await photo.getAttribute("src");
  expect(source).toMatch(/^data:image\/jpeg;base64,/);
  await page.reload();
  await expect(photo).toHaveAttribute("src", source);
  await photoPanel.getByRole("button", { name: "Editar foto" }).click();
  await expect(guide).toHaveCSS("border-top-left-radius", "50%");
  await expect(zoom).toHaveValue("3");
  expect(await guide.evaluate(element => element.style.left)).toBe(savedPosition);
  await expect(savePhoto).toHaveCount(0);
  await bounds.press("ArrowLeft");
  await expect(savePhoto).toBeVisible();
  await editor.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.locator("aside").getByRole("img", { name: "Foto de perfil" })).toHaveAttribute("src", source);
});
