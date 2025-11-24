import { test, expect } from '@playwright/test';
import { registerWith, User } from './helper';

test.describe('Login volunteer', () => {

  test('SC05_TC01 - Login successful with correct password', async ({ page }) => {
    await page.goto('/benevol');
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await page.fill('#password', 'VolunteerAccess123-');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Connexion réussie !')).toBeVisible();
    await expect(page.locator('text=Bienvenue sur votre espace')).toBeVisible();
  });

  test('SC06_TC01 - Login failed with incorrect password', async ({ page }) => {
    await page.goto('/benevol');

    await expect(page.locator('#password')).toBeVisible();

    await page.fill('#password', 'MauvaisMotDePasse123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Mot de passe invalide')).toBeVisible();
  });

  test('SC07_TC01 - The email field is pre-filled with volunteer@terroircie.be', async ({ page }) => {
    await page.goto('/benevol');

    const emailInput = page.locator('input[type="text"]'); 
    await expect(emailInput).toHaveValue('volunteer@terroircie.be');
  });

  test('SC07_TC02 - The email field is disabled (not editable)', async ({ page }) => {
    await page.goto('/benevol');

    const emailInput = page.locator('input[type="text"]'); 
    await expect(emailInput).toBeDisabled();
  });
});