import { test, expect } from '@playwright/test';
import { ProductLot, createLot } from './helper';

const productLot:ProductLot = {
  productLabel: 'Produit Test',
  productType: 'Légumes',
  imageUrl: './fixtures/brocolii.png',
  producerEmail: 'producer@terroircie.be',
  unitPrice: 10,
  availabilityDate: '2026-12-01',
  productUnit: 'kg',
  productDescription: 'Description du produit test',
  initialQuantity: 10,
};

test.describe.serial('Modifier image lot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'producer@terroircie.be');
    await page.fill('#password', 'Password1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/my-lots');
  });
 /* 
  test('SC08_TC01 – Uploader une image remplace celle du lot', async ({ page }) => {

    await page.goto('/create-lot');
    await createLot(page, productLot);
    await expect(page).toHaveURL('/my-lots', { timeout: 10000 });
    
    await page.goto('/edit-lot-image/1');
    await expect(page.getByText("producer")).toBeVisible();
    await expect(page.locator('text=Modifier l\'image du lot')).toBeVisible();

    const fileInput2 = page.locator('input[type="file"][id="image"]');
    await fileInput2.setInputFiles('./fixtures/pomme-reinette.png');

    await expect(page.getByText('Image sélectionnée avec succès')).toBeVisible();

    await page.locator('button[type="submit"]').click();
    await expect(page).not.toHaveURL('/my-lots', { timeout: 7000 });
  });
*/
  test('SC09_TC01 – Lot inexistant : afficher le message d’erreur approprié', async ({ page }) => {
    await page.goto('/edit-lot-image/99999');
    await expect(
      page.getByText("Ce lot est introuvable ou n'existe pas.")
    ).toBeVisible();
  });

  test('SC10_TC01 – Produit non chargé : afficher une erreur si on clique sur "Choisir une image"', async ({ page }) => {
    await page.goto('/edit-lot-image/abc');
    const existingImageBtn = page.getByRole('button', { name: /choisir une image existante/i });
    await existingImageBtn.click();

    await expect(
      page.getByText("Ce lot est introuvable ou n'existe pas.")
    ).toBeVisible();
  });
});
