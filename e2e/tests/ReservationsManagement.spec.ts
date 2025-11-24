import { test, expect } from '@playwright/test';

test.describe.serial('Gestion des réservations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@terroircie.be');
    await page.fill('#password', 'Admin1-');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/proposed-lots', { timeout: 10000 });
  });

  test('SC35_TC01 : Les réservations en attente sont affichées', async ({ page }) => {
    await page.click('button:has-text("Réservations")', { timeout: 10000 });
    await expect(page.getByText('Réservations des clients')).toBeVisible();
    await expect(page.getByText('Réservation n°1')).toBeVisible();
    await expect(page.getByText('user user').first()).toBeVisible();
    await expect(page.getByText('Récupérée').first()).toBeVisible();
    await expect(page.getByText('Abandonnée').first()).toBeVisible();
  });

  test('SC35_TC02 : Cliquer sur "Récupérée" met à jour le statut', async ({ page }) => {
    await page.click('button:has-text("Réservations")');
    await expect(page.getByText('Réservation n°1')).toBeVisible();
  
    const card = page.locator('text=Réservation n°1').locator('xpath=ancestor::div[contains(@class, "MuiCardContent-root")]');
  
    const retrievedButton = card.getByRole('button', { name: 'Récupérée' });
    await expect(retrievedButton).toBeVisible();
    await expect(retrievedButton).toBeEnabled();
    await retrievedButton.click();
  
    await expect(card.getByText('Récupérée')).toBeVisible();
  });
  

  test('SC35_TC03 : Cliquer sur "Abandonnée" met à jour le statut', async ({ page }) => {
    await page.click('button:has-text("Réservations")');
    await expect(page.getByText('Réservation n°4')).toBeVisible();
  
    const card = page.locator('text=Réservation n°4').locator('xpath=ancestor::div[contains(@class, "MuiCardContent-root")]');
  
    const button = card.getByRole('button', { name: 'Abandonnée' });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();

    await expect(card.getByText('Abandonnée')).toBeVisible();
  });


});
