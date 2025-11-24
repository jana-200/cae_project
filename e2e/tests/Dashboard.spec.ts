import { test, expect } from '@playwright/test';

test.describe('Dashboard Statistics', () => {
  const email = 'admin@terroircie.be';
  const password = 'Admin1-';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await page.goto('/dashboard');
  });

  /*test('SC31_TC01: Recherche avec nom de produit et année affiche graphique et totaux mensuels', async ({ page }) => {
    await page.getByLabel('Nom du produit').fill('Granny');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.getByTestId('year-select').click(); 
    await page.getByRole('option', { name: '2024' }).click(); 
    await page.getByRole('button', { name: 'Rechercher' }).click();

    await expect(page.getByText('Évolution des ventes')).toBeVisible();
    await expect(page.getByText('Résumé des ventes')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Total reçues' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Total vendues' })).toBeVisible();

  });

  test('SC31_TC02: Recherche avec produit, année et mois affiche les statistiques quotidiennes', async ({ page }) => {
    await page.getByLabel('Nom du produit').fill('Granny');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.getByTestId('year-select').click(); 
    await page.getByRole('option', { name: '2024' }).click(); 
    await page.getByTestId('month-select').click();
    await page.getByRole('option', { name: 'Mars' }).click(); 

    await page.getByRole('button', { name: 'Rechercher' }).click();
    await expect(page.getByText('Jour du mois')).toBeVisible();
    await expect(page.getByText('Résumé des ventes')).toBeVisible();
  });
  
    */

  test('SC31_TC03: Le bouton Rechercher est désactivé si le champ produit est vide', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Rechercher' })).toBeDisabled();
  });

  test('SC31_TC04: Le champ Mois est désactivé si aucune année n’est sélectionnée', async ({ page }) => {
    const monthSelect = page.getByTestId('month-select');
    await expect(monthSelect).toHaveClass(/Mui-disabled/);
  });

  test('SC31_TC05: Affiche un message d’erreur si fetch échoue', async ({ page }) => {
    await page.getByLabel('Nom du produit').fill('ProduitInexistant');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Rechercher' }).click();

    await expect(page.getByText('Aucun produit correspondant trouvé. Veuillez vérifier votre saisie.')).toBeVisible();
  });

  test('SC31_TC06: Suggestions de produit apparaissent à partir de 2 caractères', async ({ page }) => {
    await page.getByLabel('Nom du produit').fill('Gr');
    await page.waitForTimeout(1000);
    const options = page.locator('.MuiAutocomplete-option');
    await expect(options.first()).toBeVisible();
  });
});
