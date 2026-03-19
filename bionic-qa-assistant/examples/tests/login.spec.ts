import { test, expect } from '@playwright/test';
import { LoginPage } from './pom/login.page';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Pozytywny scenariusz (Happy Path)
  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.login('user@example.com', 'SuperSecretPassword123!');
    
    // Zamiast waitForTimeout, używamy auto-waitingu z expect
    await expect(page.getByRole('heading', { name: 'Witaj w panelu' })).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  // Negatywny scenariusz (Edge Case)
  test('should display error message with invalid credentials', async ({ page }) => {
    await loginPage.login('wrong@example.com', 'invalidpass');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Nieprawidłowy e-mail lub hasło.');
    await expect(page).toHaveURL('/login');
  });

  // Negatywny scenariusz (Edge Case)
  test('should fail to login with missing password', async ({ page }) => {
    // Brakuje hasła
    await loginPage.emailInput.fill('user@example.com');
    await loginPage.submitButton.click();
    
    // Walidacja po stronie UI
    await expect(page.getByText('Pole hasło jest wymagane')).toBeVisible();
  });
});
