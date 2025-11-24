import { test, expect } from '@playwright/test';

test.describe('Gestion des types de produits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@terroircie.be');
    await page.fill('#password', 'Admin1-');
    await page.click('button[type="submit"]');
    await page.waitForURL('/proposed-lots', { timeout: 10000 });
    await page.getByTestId('logo').click();
    await page.getByTestId('product-types').click();
  });

  test('SC36_TC01 : Vérifier que la liste des types s’affiche correctement', async ({ page }) => {
    await expect(page.getByText('Légumes')).toBeVisible();
    await expect(page.getByText('Fruits')).toBeVisible();
  });

  test('SC36_TC02 : Vérifier que l’ajout d’un type vide affiche une erreur', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajouter' }).click();
    const errorText = page.getByText('Le nom du type ne peut pas être vide.');
    await expect(errorText).toBeVisible();
  });

  test('SC36_TC03 : Vérifier que l’ajout d’un type déjà existant affiche une erreur', async ({ page }) => {
    await page.getByLabel('Ajouter un type').fill('Fruits');
    await page.getByRole('button', { name: 'Ajouter' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Confirmer' }).click();

    const errorText = page.getByText('Ce type existe déjà.');
    await expect(errorText).toBeVisible();
  });

  test('SC36_TC04 : Vérifier que la modification d’un type met la liste à jour', async ({ page }) => {
    const modifierBtn = page.getByRole('button', { name: 'Modifier' }).first();
    await modifierBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const input = dialog.getByRole('textbox');
    await input.fill('modifié');

    await dialog.getByRole('button', { name: 'Confirmer' }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByText('modifié')).toBeVisible();
  });
});
