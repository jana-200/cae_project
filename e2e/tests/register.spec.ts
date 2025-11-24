import { test, expect } from "@playwright/test";
import { registerWith, User } from "./helper";

const validUser: User = {
  title: "Mr",
  firstname: "Jean",
  lastname: "Dupont",
  phoneNumber: "+32456789012",
  email: "jean.dupont@example.com",
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

test.describe("RegisterPage", () => {
  test("SC23_TC01: Fill in all required fields with valid values", async ({ page }) => {
    await page.goto(`/register`);
    await registerWith(page, validUser);

    await expect(page).toHaveURL(`/login`);
    await expect(page.locator("text=Inscription réussie")).toBeVisible();
  });

  test("SC23_TC02: Fill in all fields, including optional fields", async ({ page }) => {
    const userWithPoBox = { ...validUser, email:"test1@example.be", address: { ...validUser.address, poBox: "2B" } };
    await page.goto(`/register`);
    await registerWith(page, userWithPoBox);

    await expect(page).toHaveURL(`/login`);

    // success message
    await expect(page.locator("text=Inscription réussie")).toBeVisible();
  });

  test("SC24_TC01: The 'Lastname' field contains numbers", async ({ page }) => {
    const invalidUser = { ...validUser, lastname: "Dupont123" };
    await page.goto('/register');
    await registerWith(page, invalidUser);

     // error message
    await expect(page.locator("text=Le nom ne doit pas contenir de chiffres.")).toBeVisible();
  });

  test("SC24_TC02: The 'Firstname' field contains numbers", async ({ page }) => {
    const invalidUser = { ...validUser, firstname: "Jean123" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);

 // error message
   await expect(page.locator("text=Le prénom ne doit pas contenir de chiffres.")).toBeVisible();
  });

  test("SC24_TC03: The 'Phone Number' field contains letters", async ({ page }) => {
    const invalidUser = { ...validUser, phoneNumber: "123ABC" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);

 // error message
   await expect(page.locator("text=Le numéro de téléphone doit commencer par 0 (national) ou + (international), et contenir uniquement des chiffres.")).toBeVisible();
  });

  test("SC24_TC04: The 'Email' field contains an invalid format", async ({ page }) => {
    const invalidUser = { ...validUser, email: "invalid-email" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);

 // error message
   await expect(page.locator("text=L'adresse email n'est pas valide.")).toBeVisible();
  });

  test("SC24_TC05: The password does not contain an uppercase letter", async ({ page }) => {
    const invalidUser = { ...validUser, password: "password1!" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);

    // error message
    await expect(page.locator("text=Le mot de passe doit contenir au minimum 6 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.")).toBeVisible();
  });
  
  test("SC24_TC06: The password does not contain a number", async ({ page }) => {
    const invalidUser = { ...validUser, password: "Password!", confirmPassword: "Password!" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);
  
 // error message
   await expect(page.locator("text=Le mot de passe doit contenir au minimum 6 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.")).toBeVisible();
  });
  
  test("SC24_TC07: The password does not contain a special character", async ({ page }) => {
    const invalidUser = { ...validUser, password: "Password1", confirmPassword: "Password1" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);
  
    // error message
    await expect(page.locator("text=Le mot de passe doit contenir au minimum 6 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.")).toBeVisible();
  });
  
  test("SC24_TC08: The password contains less than 6 characters", async ({ page }) => {
    const invalidUser = { ...validUser, password: "P1!", confirmPassword: "P1!" };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);
  
 // error message
   await expect(page.locator("text=Le mot de passe doit contenir au minimum 6 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.")).toBeVisible();
  });
  
  test("SC24_TC09: The postal code contains letters", async ({ page }) => {
    const invalidUser = { ...validUser, address: { ...validUser.address, postalCode: "75A01" } };
    await page.goto(`/register`);
    await registerWith(page, invalidUser);
  
 // error message
   await expect(page.locator("text=Le code postal doit être composé uniquement de chiffres.")).toBeVisible();
  });

  test("SC25_TC01: Passwords do not matc ", async ({ page }) => {
    await page.goto(`/register`);
    const invalidUser = { ...validUser, email: "test6@ex.be", password:"Password1!", confirmPassword: "DifferentPassword!" };
    await registerWith(page, invalidUser);

 // error message
   await expect(page.locator("text=Le mot de passe et sa confirmation ne correspondent pas.")).toBeVisible();
  });

  test("SC26_TC01: The email address is already in use", async ({ page }) => {
    await page.goto(`/register`);
    await registerWith(page, validUser);

    await page.goto(`/register`);
    await registerWith(page, validUser);

 // error message
   await expect(page.locator("text=Adresse email déjà utilisée.")).toBeVisible();
  });
});