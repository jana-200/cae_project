import { test, expect } from '@playwright/test';
import { registerWith, User } from './helper';

const timestamp = Date.now();
const user: User = {
  title: 'Mme',
  firstname: 'Lucie',
  lastname: 'Dubois',
  phoneNumber: '+32456789012',
  email: `profiltest${timestamp}@example.com`,
  password: 'Password1$',
  confirmPassword: 'Password1$',
  address: {
    street: 'Rue de la Vie',
    number: '42',
    postalCode: '5000',
    city: 'Namur',
    country: 'Belgium',
  },
  role: 'CUSTOMER',};

test.describe('ProfilePage - Affichage et modification du mot de passe', () => {
  const newPassword = 'NewPassword1$';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    try {
      await page.goto('/register', { waitUntil: 'load', timeout: 60000 });
      await registerWith(page, user);
      await expect(page).not.toHaveURL(/\/register/); 
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de l’utilisateur :', error);
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load', timeout: 60000 });
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.click('button[type="submit"]');

    await expect(page).not.toHaveURL(/\/login/);

    await page.goto('/profile', { waitUntil: 'load', timeout: 60000 });
    await expect(page.getByRole('button', { name: 'Modifier mon mot de passe' })).toBeVisible();
  
  });

  /*test('TC-PROFIL-1: Affiche les données utilisateur correctement', async ({ page }) => {
    await expect(page.getByLabel('Adresse email')).toHaveValue(user.email);
    await expect(page.getByLabel('Numéro de téléphone')).toHaveValue(user.phoneNumber);
    await expect(page.getByLabel('Pays')).toHaveValue(user.address.country);
  });*/

  test('SC18_TC01: Ouvre et ferme la modale de changement de mot de passe', async ({ page }) => {
    await page.getByRole('button', { name: 'Modifier mon mot de passe' }).click();
    await expect(page.getByText('Modifier le mot de passe')).toBeVisible();

    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('Modifier le mot de passe')).not.toBeVisible();
  });

  test('SC19_TC01: Affiche une erreur si les champs sont vides', async ({ page }) => {
    await page.getByRole('button', { name: 'Modifier mon mot de passe' }).click();
    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(page.getByText('Veuillez entrer votre mot de passe actuel.')).toBeVisible();
    await expect(page.getByText('Veuillez entrer un nouveau mot de passe.')).toBeVisible();
    await expect(page.getByText('Veuillez confirmer votre nouveau mot de passe.')).toBeVisible();
  });

  test('SC20_TC01: Affiche une erreur si les mots de passe ne correspondent pas', async ({ page }) => {
    await page.getByRole('button', { name: 'Modifier mon mot de passe' }).click();
    await page.getByLabel('Mot de passe actuel').fill(user.password);
    await page.getByLabel('Nouveau mot de passe').nth(0).fill(newPassword);
    await page.getByLabel('Confirmer le nouveau mot de passe').fill('AutreMotDePasse1$');

    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByText('Les mots de passe ne correspondent pas.')).toBeVisible();
  });

  test('SC21_TC01: Affiche une erreur si le mot de passe est incorrect', async ({ page }) => {
    await page.getByRole('button', { name: 'Modifier mon mot de passe' }).click();
    await page.getByLabel('Mot de passe actuel').fill('WrongPass1$');
    await page.getByLabel('Nouveau mot de passe').nth(0).fill(newPassword);
    await page.getByLabel('Confirmer le nouveau mot de passe').fill(newPassword);

    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByText('Le mot de passe actuel est incorrect.')).toBeVisible();
  });

  test('SC22_TC01: Change le mot de passe avec succès', async ({ page }) => {
    await page.getByRole('button', { name: 'Modifier mon mot de passe' }).click();
    await page.getByLabel('Mot de passe actuel').fill(user.password);
    await page.getByLabel('Nouveau mot de passe').nth(0).fill(newPassword);
    await page.getByLabel('Confirmer le nouveau mot de passe').fill(newPassword);

    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(page.getByText('Modifier le mot de passe')).not.toBeVisible();
  });
});