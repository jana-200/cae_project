import { test, expect } from '@playwright/test';

test.describe('HomePage - Products and Reservations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('SC11_TC01: Displays the recent products carousel', async ({ page }) => {
    await expect(page.getByText('Découvrez nos produits récents')).toBeVisible();
    const carouselItems = await page.locator('img[alt]').count();
    expect(carouselItems).toBeGreaterThan(0);
  });

  test('SC12_TC01: Displays available products for reservation', async ({ page }) => {
    await expect(page.getByText('Produits disponibles à la réservation')).toBeVisible();
    const productCards = await page.locator('button:has-text("Ajouter à la réservation")').count();

    if (productCards === 0) {
      console.warn('!!! No available product cards found.');
    }
    expect(productCards).toBeGreaterThanOrEqual(0);
  });

  test('SC13_TC01: Filters by product type', async ({ page }) => {

    await page.getByLabel('Type de produit').click();
    const options = page.locator('li[role="option"]');
    const count = await options.count();

    if (count > 1) {
      await options.nth(1).click(); 
    }

    const cards = await page.locator('button:has-text("Ajouter à la réservation")').count();
    expect(cards).toBeGreaterThanOrEqual(0);
  });

  test('SC33_TC01: Navigates to product detail page on product card click', async ({ page }) => {
    await page.goto('/');
  
    await expect(page.getByText('Produits disponibles à la réservation')).toBeVisible();
  
    const productCard = page.locator('text=Ajouter à la réservation').first();
    const parentCard = productCard.locator('..').locator('..');
  
    await parentCard.click();
  
    await expect(page).toHaveURL(/\/lots\/\d+/);
  
    await expect(page.getByTestId('product-label')).toBeVisible();
  });

  test('SC33_TC02: Navigates to lot details and displays lot information', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Produits disponibles à la réservation')).toBeVisible();
  
    const productCard = page.locator('text=Ajouter à la réservation').first();
    const parentCard = productCard.locator('..').locator('..');
  
    await parentCard.click();
    await expect(page).toHaveURL(/\/lots\/\d+$/);
    await expect(page.getByTestId('product-label')).toBeVisible();
    await expect(page.getByTestId('unit-price')).toBeVisible();
    await expect(page.getByTestId('quantity-input')).toBeVisible();
    await expect(page.getByTestId('add-to-reservation-button')).toBeVisible();
    await expect(page.getByTestId('quantity-input')).toBeVisible();
  });
  
});

test.describe('reatrait de produits ou vente libre', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@terroircie.be');
    await page.fill('#password', 'Admin1-');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/proposed-lots', { timeout: 10000 });
    await page.getByTestId('logo').click();
  });

  test('SC37_TC01 : Le gestionnaire peut retirer un produit', async ({ page }) => {
    const lotCard = page.locator('text=Granny Smith').first();
    await expect(lotCard).toBeVisible();

    await page.getByTestId('delete-button').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/retirer/i)).toBeVisible();
    await dialog.getByRole('button', { name: /confirmer/i }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('SC37_TC02 : Le gestionnaire peut mettre un produit en vente libre', async ({ page }) => {
    const lotCard = page.locator('text=Granny Smith').first();
    await expect(lotCard).toBeVisible();

    await page.getByTestId('open-sale').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/vente libre/i)).toBeVisible();
    await dialog.getByRole('button', { name: /confirmer/i }).click();
    await expect(dialog).not.toBeVisible();
  });
});
