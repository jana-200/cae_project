import { test, expect } from '@playwright/test';

import { createLot, ProductLot, registerWith, User , createWith} from './helper';

const validUser: User = {
  title: "Mr",
  firstname: "Jean",
  lastname: "Dupont",
  phoneNumber: "+32456789012",
  email: "notif@example.com",
  password: "Password1!",
  confirmPassword: "Password1!",
  address: {
    street: "Rue de la Paix",
    number: "123",
    postalCode: "75001",
    city: "Paris",
    country: "France",
  },
  role: "CUSTOMER",
};
const productLot:ProductLot = {
  productLabel: 'Produit Test',
  productType: 'légumes',
  imageUrl: './fixtures/brocolii2.png',
  producerEmail: 'notifProducer@example.com',
  unitPrice: 12,
  availabilityDate: '2026-12-01',
  productUnit: 'kg',
  productDescription: 'Description du produit test',
  initialQuantity: 10,
};

test.describe.serial('Notifications', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'producer@terroircie.be');
    await page.fill('#password', 'Password1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/my-lots');
    await page.getByTestId('user-menu-button').click();
    await page.getByRole('menuitem', { name: /notifications/i }).click();
  });  

  test('SC34_TC01 : Les notifications sont affichées', async ({ page }) => {
    await expect(page.getByText('Mes Notifications')).toBeVisible();
    await expect(page.getByText('Bienvenue').first()).toBeVisible();
    await expect(page.getByText('Mise à jour').first()).toBeVisible();
  });

  test('SC34_TC02 : Cliquer sur une notification la marque comme lue', async ({ page }) => {
    const notif = page.getByText('Bienvenue').first();
    await expect(notif).toBeVisible();

    await notif.click();

    const chip = notif.locator('..').getByText('Lue');
    await expect(chip).toBeVisible();
  });

  test('SC34_TC03 : "Marquer tout comme lu" fonctionne', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Marquer tout comme lu' });
    await button.click();

    const chips = await page.locator('text=Lue').all();
    expect(chips.length).toBeGreaterThanOrEqual(2);
  });

  test('SC34_TC04 : recevoir une notification', async ({ page }) => { 
    await page.click('button:has-text("proposer un lot")');
    createLot(page, productLot);
    await expect(page).toHaveURL('/my-lots', { timeout: 10000 });
    await page.getByTestId('user-menu-button').click();
    await page.getByRole('menuitem', { name: /notifications/i }).click();
    await expect(page.getByText('Mes Notifications')).toBeVisible();
    await expect(page.getByText('Bienvenue').first()).toBeVisible();
    await expect(page.getByText('Lot proposé avec succés').first()).toBeVisible();

    await page.getByTestId('user-menu-button').click();
    await page.getByRole('menuitem', { name: /Déconnexion/i }).click();

  });
});
