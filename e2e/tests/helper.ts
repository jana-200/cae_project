import { Page, expect } from "@playwright/test";

interface Address {
  street: string;
  number: string;
  poBox?: string;
  postalCode: string;
  city: string;
  country: string;
}

interface User {
  firstname: string;
  lastname: string;
  title: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: Address;
  registrationDate?: string;
  role: string;
}

async function registerWith(page: Page, user: User): Promise<void> {
  const {
    title,
    firstname,
    lastname,
    phoneNumber,
    email,
    password,
    confirmPassword,
    address: { street, number, poBox, postalCode, city, country },
  } = user;

  await page.locator(`input[value="${title}"]`).click();
  await page.locator("#lastname").fill(lastname);
  await page.locator("#firstname").fill(firstname);
  await page.locator("#street").fill(street);
  await page.locator("#number").fill(number);

  if (poBox) {
    await page.locator("#poBox").fill(poBox);
  }

  await page.locator("#postalCode").fill(postalCode);
  await page.locator("#city").fill(city);
  await page.locator("#country").fill(country);
  await page.locator("#phoneNb").fill(phoneNumber);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#confirmPswd").fill(confirmPassword);


  await page.locator('button[type="submit"]').click();
}

interface ManProd {
  firstname: string;
  lastname: string;
  title: string;
  phoneNumber: string;
  email: string;
  password: string;
  address: Address;
  registrationDate?: string;
  role: string;
  companyName?: string;
}

interface ProductLot {
  productLabel: string;
  productType: string;
  imageUrl: string;
  producerEmail: string;
  unitPrice: number;
  availabilityDate: string;
  productUnit: string;
  productDescription: string;
  initialQuantity: number;
}


async function createWith(page: Page, user: ManProd): Promise<void> {
  const {
    title,
    firstname,
    lastname,
    phoneNumber,
    email,
    address: { street, number, poBox, postalCode, city, country },
    role,
    companyName,
  } = user;

  await page.locator(`input[value="${title}"]`).click();
        await page.locator('#lastname').first().fill(lastname);
        await page.locator('#firstname').fill(firstname);
        await page.locator('#street').fill(street);
        await page.locator('#number').fill(number);
        await page.locator('#postalCode').fill(postalCode);
        await page.locator('#city').fill(city);
        await page.locator('#country').fill(country);
        await page.locator('#phoneNb').fill(phoneNumber);
        await page.locator('#email').fill(email);
        await page.locator("select").selectOption(role);

    if (role === "PRODUCER" && companyName) {
      await page.locator('#companyName').fill(companyName);
    }
    await page.locator('button[type="submit"]').click();
}

async function createLot(page: Page, lot: ProductLot): Promise<void> {
  const {
    productLabel,
    productType,
    imageUrl,
    unitPrice,
    availabilityDate,
    productUnit,
    productDescription,
    initialQuantity,
  } = lot;
  await page.waitForSelector('[data-testid="productLabelInput"] input', { timeout: 5000 });
      
      const input = page.locator('[data-testid="productLabelInput"] input');
      await input.click();
      await input.fill('');
      await input.type(productLabel, { delay: 100 }); 
  
      await page.locator('#productType').click();
      await page.locator(`text=${productType}`).click(); 
      
      await page.locator("#unit").fill(productUnit);
      await page.locator("#productDescription").fill(productDescription);
      await page.locator("#availabilityDate").fill(availabilityDate);
      await page.locator("#initialQuantity").fill(String(initialQuantity));
      await page.locator("#unitPrice").fill(String(unitPrice));
     
      const fileInput = page.locator('input[type="file"][id="image"]');
      await fileInput.setInputFiles(imageUrl);
      await expect(page.getByText('Image sélectionnée avec succès')).toBeVisible();

      await page.locator('button[type="submit"]').click();
}

export { registerWith, User, Address , createWith, ManProd, ProductLot, createLot };
