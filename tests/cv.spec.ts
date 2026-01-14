import { expect, test } from "@playwright/test";

test.describe("CV Page", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/cv`);
  });

  test("CV page renders with correct SEO metadata", async ({ page }) => {
    await expect(page).toHaveTitle(
      "CV | Michalina Graczyk - Engineering Manager",
    );

    const descriptionMetaTag = page.locator("meta[name='description']");
    await expect(descriptionMetaTag).toHaveAttribute(
      "content",
      "CV i doświadczenie zawodowe. Engineering Manager z ponad 10-letnim doświadczeniem w IT, specjalizująca się w QA, Test Automation i AI-driven Testing.",
    );
  });

  test("CV header displays name and title from data", async ({ page }) => {
    const main = page.locator("#main-content");
    const name = main.locator("header h1");
    await expect(name).toHaveText("Michalina Graczyk");

    const title = main.locator("header p").first();
    await expect(title).toHaveText("Engineering Manager");
  });

  test("CV social links are present in header", async ({ page }) => {
    const main = page.locator("#main-content");
    const header = main.locator("header");

    const linkedInLink = header.getByRole("link", { name: "LinkedIn" });
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/michalina-graczyk/",
    );

    const githubLink = header.getByRole("link", { name: "GitHub" });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/michalina-graczyk",
    );
  });

  test("CV sections are rendered from data", async ({ page }) => {
    // Verify all sections are present
    const sections = [
      "O mnie",
      "Doświadczenie",
      "Edukacja",
      "Certyfikaty",
      "Publikacje",
    ];

    for (const section of sections) {
      await expect(page.getByRole("heading", { name: section })).toBeVisible();
    }
  });

  test("CV experience entries are rendered", async ({ page }) => {
    // Check that experience entries from JSON are displayed
    const experienceItems = [
      "Engineering Manager",
      "Head of Quality Assurance",
      "Quality Assurance Specialist",
    ];

    for (const item of experienceItems) {
      await expect(page.getByRole("heading", { name: item })).toBeVisible();
    }
  });

  test("CV certifications with credential IDs are displayed", async ({
    page,
  }) => {
    // ISTQB has a credential ID
    await expect(page.getByText("ID: 06281/FLCT/2016")).toBeVisible();
    // Datadog has a credential ID
    await expect(page.getByText("ID: eukfvuvi0u")).toBeVisible();
  });
});
