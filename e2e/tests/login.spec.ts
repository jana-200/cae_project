import { test, expect } from '@playwright/test';
import { registerWith, User } from "./helper";

const validUser: User = {
  title: "Mr",
  firstname: "Luc",
  lastname: "Dubois",
  phoneNumber: "+32456789012",
  email: "lucie.dubois@example.com",
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

test.describe.serial('Login Page', () => {

  test('SC14_TC01 - Successful login with valid credentials', async ({ page }) => {
    await page.goto('/register');
    await registerWith(page, validUser);
   
    await page.goto('/login');
    
    await page.fill('#email', 'lucie.dubois@example.com');
    await page.fill('#password', 'Password1!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
  });

  test('SC14_TC02 - Failed login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toHaveText('Email ou mot de passe incorrect');
  });

  test('SC14_TC03 - Login with "Remember Me" option"', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('#email', 'lucie.dubois@example.com');
    await page.fill('#password', 'Password1!');
    await page.check('input[type="checkbox"]'); 
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL("/", { timeout: 5000 });

    await page.reload(); 
    await expect(page).toHaveURL("/", { timeout: 5000 });

  });

});
