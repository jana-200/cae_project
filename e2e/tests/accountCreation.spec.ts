import { test, expect, request } from "@playwright/test";
import { registerWith, createWith } from "./helper";

const managerUser = {
  title: "Mr",
  firstname: "Jean",
  lastname: "Dupont",
  phoneNumber: "+32456789012",
  email: "jean.manager@example.com",
  password: "Password1!",
  role: "MANAGER",
  address: {
    street: "Rue de la Paix",
    number: "123",
    postalCode: "75001",
    city: "Paris",
    country: "France",
    poBox: "",
  },
};

const producerUser = {
  title: "Mme",
  firstname: "Claire",
  lastname: "Verger",
  phoneNumber: "+32456789123",
  email: "claire.producer@example.com",
  password: "Password1!",
  role: "PRODUCER",
  address: {
    street: "Rue des Pommes",
    number: '7',
    postalCode: '5000',
    city: "Namur",
    country: "Belgique",
    poBox: "",
  },
  companyName: "Les Délices de Claire",
};

let generatedPassword = "";

test.describe.serial("Account Creation - Manager", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('#email', 'admin@terroircie.be');
    await page.fill('#password', 'Admin1-');
    await page.click('button[type="submit"]'); 
  });

  test("SC01_TC01: Submit valid form as MANAGER", async ({ page }) => {
    await page.goto("/account-creation");
    await expect(page.getByText('Inscription')).toBeVisible();
    await createWith(page, managerUser);

    await expect(page.locator('[data-testid="success-title"]')).toBeVisible();
    await expect(page.getByText(`Login : ${managerUser.email}`)).toBeVisible();
    const passwordText = await page.locator("text=Mot de passe :").textContent();
    expect(passwordText).toMatch(/Mot de passe : .+/);
    generatedPassword = passwordText?.split(": ")[1] || "";
    await page.getByRole("button", { name: "Revenir à la page d'accueil" }).click();
    await expect(page).toHaveURL("/");
  });

  test("SC02_TC01: Selecting PRODUCER displays company name field", async ({ page }) => {

    await page.goto("/account-creation");
    await page.locator('select').selectOption("PRODUCER");
    await expect(page.locator('#companyName')).toBeVisible();
  });

  test("SC02_TC02: Fill all fields as PRODUCER and submit", async ({ page }) => {
    await page.goto("/account-creation");
    await createWith(page, producerUser);

    await expect(page.locator('[data-testid="success-title"]')).toBeVisible();
    const passwordText = await page.locator("text=Mot de passe :").textContent();
    generatedPassword = passwordText?.split(": ")[1] || "";
    await page.getByRole("button", { name: "Revenir à la page d'accueil" }).click();
    await expect(page).toHaveURL("/");
  });

  test("SC03_TC01: The 'Lastname' field contains numbers", async ({ page }) => {
  
    const invalidUser = { ...producerUser, lastname: "Dupont123" };
    await page.goto("/account-creation");
    await createWith(page, invalidUser);
    await expect(page.locator("text=Le nom ne doit pas contenir de chiffres.")).toBeVisible();
  });

  test("SC03_TC02: The 'Firstname' field contains numbers", async ({ page }) => {

    const invalidUser = { ...producerUser, firstname: "Jean123" };
    await page.goto("/account-creation");
    await createWith(page, invalidUser);
    await expect(page.locator("text=Le prénom ne doit pas contenir de chiffres.")).toBeVisible();
  });

  test("SC03_TC03: The 'Phone Number' field contains letters", async ({ page }) => {
    const invalidUser = { ...producerUser, phoneNumber: "123ABC" };
    await page.goto("/account-creation");
    await createWith(page, invalidUser);
    await expect(page.locator("text=Le numéro de téléphone doit commencer par 0 (national) ou + (international), et contenir uniquement des chiffres.")).toBeVisible();
  });

  test("SC03_TC04: The 'Email' field contains an invalid format", async ({ page }) => {
    const invalidUser = { ...producerUser, email: "invalid-email" };
    await page.goto("/account-creation");

    await createWith(page, invalidUser);
    await expect(page.locator("text=L'adresse email n'est pas valide.")).toBeVisible();
  });

  test("SC03_TC05: The postal code contains letters", async ({ page }) => {

    const invalidUser = { ...producerUser, address: { ...producerUser.address, postalCode: "75A01" } };
    await page.goto("/account-creation");
    await createWith(page, invalidUser);
    await expect(page.locator("text=Le code postal doit être composé uniquement de chiffres.")).toBeVisible();
  });

  test("SC04_TC01: already used email", async ({ page }) => {

    const validUser = { ...producerUser, email: `test${Date.now()}@example.com` };
    await page.goto("/account-creation");
    await createWith(page, validUser);
    await expect(page.locator('[data-testid="success-title"]')).toBeVisible();
    await page.locator("text=Revenir à la page d'accueil").click();

    await page.goto("/account-creation");
    await expect(page.getByText('Inscription')).toBeVisible();
    await createWith(page, validUser);
    await expect(page.locator("text=Adresse email déjà utilisée.")).toBeVisible();
  });
});