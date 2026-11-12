import { expect, test } from '@playwright/test';

test('conecta portada, login vacío y portal sin recargar el documento', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (new URL(response.url()).origin === new URL(page.url()).origin && response.status() >= 400) {
      errors.push(response.status() + ' ' + response.url());
    }
  });

  await page.goto('/');
  await page.evaluate(() => { window.integrationMarker = true; });
  await page.getByRole('link', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Correo electrónico')).toHaveValue('');
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/portal-alumno$/);
  await expect(page.getByRole('heading', { name: 'Qué gusto verte de nuevo, Mariana Oliva', exact: true })).toBeVisible();
  await expect(page.locator('aside').getByRole('heading', { name: 'Mariana Oliva', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pagos', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pagos', exact: true }).click();
  await expect(page).toHaveURL(/\/portal-alumno\/pagos$/);
  await expect(page.getByText('Historial de Pagos', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.integrationMarker)).toBe(true);
  await page.reload();
  await expect(page.getByText('Historial de Pagos', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/portal-alumno$/);
  expect(errors).toEqual([]);
});

test('muestra una salida útil para direcciones y detalles inexistentes', async ({ page }) => {
  await page.goto('/no-existe');
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
  await page.goto('/portal-alumno/maestros/0');
  await expect(page.getByText('Maestro no encontrado.')).toBeVisible();
});

for (const [width, height] of [[320, 568], [390, 844], [667, 375], [768, 1024], [1024, 768], [1440, 900]]) {
  test(`vuelve a la portada desde los tres controles a ${width} × ${height}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-11T18:00:00Z'));
    await page.setViewportSize({ width, height });
    const home = page.getByRole('link', { name: 'Iniciar sesión', exact: true });
    const exit = page.getByRole('button', { name: 'Cerrar sesión', exact: true });

    async function expectLayoutToFit() {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }

    async function expectHome() {
      await expect(page).toHaveURL(/\/$/);
      await expect(home).toBeVisible();
      await expectLayoutToFit();
    }

    await page.goto('/');
    await home.click();
    await expectLayoutToFit();
    const email = page.getByLabel('Correo electrónico');
    const password = page.getByLabel('Contraseña', { exact: true });
    const reveal = page.getByRole('button', { name: 'Mostrar contraseña' });
    await expect(email).toHaveCSS('height', '52px');
    await expect(password).toHaveCSS('height', '52px');
    await expect(page.locator('label[for="email"]')).toHaveCSS('display', 'block');
    const emailBox = await email.boundingBox();
    const passwordBox = await password.boundingBox();
    const revealBox = await reveal.boundingBox();
    expect(emailBox.width).toBeGreaterThanOrEqual(270);
    expect(passwordBox.width).toBe(emailBox.width);
    expect(revealBox.y).toBe(passwordBox.y);
    expect(revealBox.x + revealBox.width).toBe(passwordBox.x + passwordBox.width);
    await page.getByRole('link', { name: /Volver al inicio/ }).click();
    await expectHome();

    await home.click();
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/portal-alumno$/);
    const logo = page.getByRole('link', { name: 'Círculo de Brujas, ir al inicio' });
    for (const control of [logo, exit]) {
      await expect(control).toBeInViewport({ ratio: 1 });
      const box = await control.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expectLayoutToFit();
    const paymentCard = page.getByRole('heading', { name: 'Estado de Pagos' }).locator('../..');
    const card = await paymentCard.boundingBox();
    for (const label of ['Adeudo', 'Próximo pago']) {
      const badge = await paymentCard.getByText(label, { exact: true }).boundingBox();
      expect(badge.x + badge.width).toBeLessThanOrEqual(card.x + card.width);
    }
    await logo.click();
    await expectHome();

    await page.goto('/portal-alumno/pagos');
    await expect(page.getByText('Historial de Pagos', { exact: true })).toBeVisible();
    await exit.click();
    const confirmation = page.getByRole('dialog', { name: '¿Estás seguro de cerrar sesión?' });
    await expect(confirmation).toBeInViewport({ ratio: 1 });
    await expect(page).toHaveURL(/\/portal-alumno\/pagos$/);
    await confirmation.getByRole('button', { name: 'Cancelar' }).click();
    await expect(confirmation).toBeHidden();
    await expect(exit).toBeFocused();
    await expect(page).toHaveURL(/\/portal-alumno\/pagos$/);
    await exit.click();
    await confirmation.getByRole('button', { name: 'Sí, cerrar sesión' }).click();
    await expectHome();
  });
}
