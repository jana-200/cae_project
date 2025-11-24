import { test, expect } from '@playwright/test';

test.describe.serial('Reservations History and Details Tests', () => {
  const email = 'user@terroircie.be';
  const password = 'Password1!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await page.goto('/my-reservations');
  });

  test('SC29_TC01: Onglet "En cours" affiche les réservations RESERVED futures', async ({ page }) => {
    await expect(page.getByText('Mes réservations')).toBeVisible();
    await expect(page.getByText('Annuler').first()).toBeVisible();
    await expect(page.locator('button:has-text("Annuler")').first()).toBeVisible();
    await expect(page.getByText(/Réservation n°/).first()).toBeVisible();
    await expect(page.getByText(/Commandée le/).first()).toBeVisible();
    await expect(page.getByText(/€/).first()).toBeVisible();
  });

  test('SC29_TC02: Onglet "Annulées" affiche uniquement les réservations CANCELED', async ({ page }) => {
    await page.getByRole('tab', { name: 'Annulées' }).click();
    await expect(page.locator('text=Annulée')).toBeVisible();
  });

  test('SC29_TC03: Onglet "Récupérées" affiche uniquement les réservations RETRIEVED', async ({ page }) => {
    await page.getByRole('tab', { name: 'Récupérées' }).click();
    await expect(page.locator('text=Récupérée')).toBeVisible();
  });

  test('SC29_TC04: Clic sur une carte de réservation redirige vers sa page détail', async ({ page }) => {
    const resCard = page.locator('text=Réservation n°').first();
    const idText = await resCard.textContent();
    const reservationId = idText?.match(/Réservation n°(\d+)/)?.[1];
    await resCard.click();
    await page.waitForURL(`/reservations/${reservationId}`);
    await expect(page.getByText('Produits de la réservation')).toBeVisible();
    await expect(page.locator('text=Granny Smith')).toBeVisible();
    await expect(page.locator('text=€').first()).toBeVisible();
  });

  test('SC29_TC05: Message "Réservation introuvable" si l\'ID est invalide', async ({ page }) => {
    await page.goto('/reservations/999999');
    await expect(page.getByText('Réservation introuvable')).toBeVisible();
  });

  test('SC30_TC01: Clic sur "Annuler" ouvre une boîte de dialogue', async ({ page }) => {
    await page.locator('button:has-text("Annuler")').first().click();
    await expect(page.getByRole('dialog')).toContainText('Êtes-vous sûr de vouloir annuler');
  });

  test('SC30_TC02: Confirmer l\'annulation retire la réservation de "En cours"', async ({ page }) => {
    const resCard = page.locator('text=Réservation n°').first();
    const idText = await resCard.textContent();
    const reservationId = idText?.match(/Réservation n°(\d+)/)?.[1];
  
    expect(reservationId).toBeDefined();
  
    await page.locator('button:has-text("Annuler")').first().click();
    await page.locator('button:has-text("Confirmer")').click();
  
    await expect(page.locator(`text=Réservation n°${reservationId}`)).toHaveCount(0);
  });
 

});
