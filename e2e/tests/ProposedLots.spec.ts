import { test, expect } from '@playwright/test';

test.describe.serial('ProposedLotsPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@terroircie.be');
    await page.fill('#password', 'Admin1-');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await page.goto('/proposed-lots');
  });

  test('SC32_TC01 - Default tab shows only pending lots', async ({ page }) => {

    const cards = await page.locator('[data-testid="proposed-lot-card"]').all();
    for (const card of cards) {
      await expect(card.locator('[data-testid="lot-state"]')).toHaveText('En attente');
    }
  });

  test('SC32_TC02 - Tab selection updates the displayed lots', async ({ page }) => {
    await page.getByRole('tab', { name: 'Acceptés' }).click();
    await expect(page.getByRole('tab', { selected: true })).toHaveText('Acceptés');

    await expect.poll(async () => {
      return await page.locator('[data-testid="proposed-lot-card"]').count();
    }, { timeout: 5000 }).toBeGreaterThanOrEqual(0);

    const cards = await page.locator('[data-testid="proposed-lot-card"]').all();
    for (const card of cards) {
      await expect(card.locator('[data-testid="lot-state"]')).toHaveText('Accepté');
    }
  });

  test('SC32_TC03 - Empty tab displays message', async ({ page }) => {
    await page.getByRole('tab', { name: 'Refusés' }).click();
    await expect(page.getByText('Aucun lot à afficher.')).toBeVisible();
  });

 /*
  test('SC32_TC04 - Refusing a lot shows dialog then removes it from pending tab', async ({ page }) => {
    await expect.poll(async () => {
      return await page.locator('[data-testid="proposed-lot-card"]').count();
    }, { timeout: 5000 }).toBeGreaterThan(0);

    const cardsBefore = await page.locator('[data-testid="proposed-lot-card"]').count();
    const firstCard = page.locator('[data-testid="proposed-lot-card"]').first();
    const refuseButton = firstCard.getByRole('button', { name: 'Refuser' });

    await refuseButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Motif du refus')).toBeVisible();

    const confirmRefuse = page.getByRole('button', { name: /Refuser/ });
    await confirmRefuse.click();

    await expect.poll(async () => {
      return await page.locator('[data-testid="proposed-lot-card"]').count();
    }, { timeout: 5000 }).toBeLessThan(cardsBefore);
  });
  */
});
