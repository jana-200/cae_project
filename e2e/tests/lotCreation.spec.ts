import { test, expect } from '@playwright/test';
import { ProductLot, createLot } from './helper';

const productLot:ProductLot = {
  productLabel: 'Produit Test',
  productType: 'Légumes',
  imageUrl: './fixtures/brocolii2.png',
  producerEmail: 'producer@terroircie.be',
  unitPrice: 12,
  availabilityDate: '2026-12-01',
  productUnit: 'kg',
  productDescription: 'Description du produit test',
  initialQuantity: 10,
};

test.describe.serial('Création de lot', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'producer@terroircie.be');
    await page.fill('#password', 'Password1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/my-lots');
  });

  /*
  
  test('SC15_TC01 –  Nouveau lot avec un produit non existant', async ({ page }) => {
    await page.goto('/create-lot');
    await createLot(page, productLot);
    await expect(page).toHaveURL('/my-lots', { timeout: 7000 });
  });

  test('SC15_TC02 – Nouveau lot avec un produit déjà existant', async ({ page }) => {
    await page.goto('/create-lot');
    await expect(page.locator('text=Proposer un nouveau lot')).toBeVisible();
  
    const input = page.locator('[data-testid="productLabelInput"] input');
    await input.click();
    await input.fill('');
    await input.type('Granny Smith', { delay: 100 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Granny Smith');

    await expect.poll(async () => {
      return await page.locator('#unit').inputValue();
    }).not.toBe('');

    await expect.poll(async () => {
      return await page.locator('#productDescription').inputValue();
    }).not.toBe('');

    await expect(page.locator('#unit')).toBeDisabled();
    await expect(page.locator('#productDescription')).toBeDisabled();
  
    await page.locator("#availabilityDate").fill('2025-12-15');
    await page.locator("#initialQuantity").fill('20');
    await page.locator("#unitPrice").fill('2.50');
    
    const fileInput = page.locator('input[type="file"][id="image"]');
    await fileInput.setInputFiles('./fixtures/brocolii3.png');
    await expect(page.getByText('Image sélectionnée avec succès')).toBeVisible();
  
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/my-lots');
  });

  test('SC15_TC03 – Sélection d’une image existante désactive l’upload', async ({ page }) => {   
    await page.goto('/create-lot');
    await expect(page.locator('text=Proposer un nouveau lot')).toBeVisible();

    const input = page.locator('[data-testid="productLabelInput"] input');
    await input.click();
    await input.fill('Granny Smith');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Granny Smith');
    
    await expect.poll(async () => {
      return await page.locator('#unit').inputValue();
    }).not.toBe('');
    
    await expect.poll(async () => {
      return await page.locator('#productDescription').inputValue();
    }).not.toBe('');
   
    const existingImageBtn = page.getByRole('button', { name: /choisir une image existante/i });
    await existingImageBtn.click();

    const image = page.locator('img[src*="https://imagestorage024.blob.core.windows.net/dev/df7bd250-4424-430f-b31a-145bec72217a"]');
    await expect(image.first()).toBeVisible();
    await image.first().click();

    
    await expect(page.getByText('Image sélectionnée avec succès')).toBeVisible();
  });

*/

  test('SC16_TC01 – Validation sans image affiche l’erreur appropriée', async ({ page }) => {

    await page.goto('/create-lot');
    await expect(page.locator('text=Proposer un nouveau lot')).toBeVisible();
  
    const input = page.locator('[data-testid="productLabelInput"] input');
    await input.click();
    await input.fill('Test sans image');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Test sans image');
  
  
    await page.locator('#productType').click();
    await page.locator('text=Légumes').click();
    await page.locator('#unit').fill('kg');
    await page.locator('#productDescription').fill('Produit de test sans image');
    await page.locator('#availabilityDate').fill('2025-12-31');
    await page.locator('#initialQuantity').fill('10');
    await page.locator('#unitPrice').fill('3.50');
  
    await page.locator('button[type="submit"]').click();
    
    await expect(page.getByText('Veuillez sélectionner ou importer une image.')).toBeVisible();
  });
  test('SC16_TC02 – Entrer une lettre dans le champ "Prix unitaire" affiche une erreur', async ({ page }) => {
  
  
    await page.goto('/create-lot');
    await expect(page.locator('text=Proposer un nouveau lot')).toBeVisible();
  

    const input = page.locator('[data-testid="productLabelInput"] input');
    await input.click();
    await input.type('Granny Smith', { delay: 100 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Granny Smith');
  

    await expect(page.locator('#productType')).toBeDisabled();
    await expect(page.locator('#unit')).toBeDisabled();
    await expect(page.locator('#productDescription')).toBeDisabled();
  
   
    await page.locator('#availabilityDate').fill('2025-12-20');
    await page.locator('#initialQuantity').fill('15');
    await page.locator('#unitPrice').fill('abc'); 
  
   
    const fileInput = page.locator('input[type="file"][id="image"]');
    await fileInput.setInputFiles('./fixtures/brocolii.png');
    await expect(page.getByText('Image sélectionnée avec succès')).toBeVisible();
  
   
    await page.locator('button[type="submit"]').click();
  
    
    await expect(
      page.getByText(/Le prix unitaire doit être un nombre positif/i)
    ).toBeVisible();
  });

  
  test('SC17_TC01 – Entrer une date dans le passé affiche une erreur', async ({ page }) => {
   
  
    await page.goto('/create-lot');
    await expect(page.locator('text=Proposer un nouveau lot')).toBeVisible();
  
   
    const input = page.locator('[data-testid="productLabelInput"] input');
    await input.click();
    await input.type('Granny Smith', { delay: 100 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Granny Smith');
  
    await expect(page.locator('#productType')).toBeDisabled();
    await expect(page.locator('#unit')).toBeDisabled();
    await expect(page.locator('#productDescription')).toBeDisabled();
  
    
    await page.locator('#availabilityDate').fill('2022-01-01');
    await page.locator('#initialQuantity').fill('10');
    await page.locator('#unitPrice').fill('2.50');
  
   
    const fileInput = page.locator('input[type="file"][id="image"]');
    await fileInput.setInputFiles('./fixtures/brocolii.png');
    await expect(page.getByText('Image sélectionnée avec succès')).toBeVisible();
  
   
    await page.locator('button[type="submit"]').click();
  
 
    await expect(
      page.getByText('Proposer un nouveau lot')).toBeVisible();
  });
  
});