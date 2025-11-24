import { test, expect } from '@playwright/test';

test.describe.serial('Reservation Page', () => {
  const email = 'user@terroircie.be';
  const password = 'Password1!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect.poll(() => page.url()).toContain('/');
    await expect(page.getByText('Produits disponibles à la réservation')).toBeVisible();
  });

  test('SC27_TC01: Réservation réussie avec redirection vers /my-reservations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Produits disponibles à la réservation')).toBeVisible();
    await page.waitForSelector('button:has-text("Ajouter à la réservation")');

    await page.locator('button:has-text("Ajouter à la réservation")').first().click();
    await page.locator('button:has-text("Confirmer")').click();

    await page.goto('/my-reservation');
    await page.getByText('Choisissez une date').click();
    const firstOption = page.locator('.MuiMenuItem-root').nth(1);
    await expect(firstOption).toBeVisible({ timeout: 3000 });
    await firstOption.click({ force: true });

    await page.locator('button:has-text("Réserver")').click();

    await page.waitForURL('/my-reservations');
    await expect(page.getByText('EN COURS')).toBeVisible();
  });

  test('SC27_TC02: Affiche une erreur si aucune date de récupération n’est sélectionnée', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Ajouter à la réservation")');

    await page.locator('button:has-text("Ajouter à la réservation")').first().click();
    await page.locator('button:has-text("Confirmer")').click();

    await page.goto('/my-reservation');
    await expect(page.locator('button:has-text("Réserver")')).toBeDisabled();
  });

  test('SC27_TC03: Affiche "Votre panier est vide" si aucun produit n’est ajouté', async ({ page }) => {
    await page.goto('/my-reservation');
    await expect(page.getByText('Votre panier est vide.')).toBeVisible();
    await expect(page.getByText('Réserver')).not.toBeVisible();
  });

  test('SC28_TC01: Suppression d’un produit du panier', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("Ajouter à la réservation")');
    await page.locator('button:has-text("Ajouter à la réservation")').first().click();
    await page.locator('button:has-text("Confirmer")').click();
  
    await page.goto('/my-reservation');
    await expect(page.getByText('Ma réservation')).toBeVisible();
  
    const deleteButton = page.getByTestId('remove-item').first();
    await deleteButton.click();    
  
    await expect(page.getByText('Votre panier est vide.')).toBeVisible();
  });
});
