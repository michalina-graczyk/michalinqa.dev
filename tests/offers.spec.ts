import { expect, test } from "@playwright/test";
import {
  expectLastEventToBeTracked,
  getTrackedEvents,
} from "./helpers/mixpanel";

const offers = [
  { slug: "konsultacje", title: "Konsultacje online 1:1" },
  { slug: "rekrutacja", title: "Rozmowa rekrutacyjna" },
  { slug: "kariera", title: "Ścieżki kariery" },
];

test.describe("Offers", () => {
  test.describe("Homepage Offer Cards", () => {
    test("offer cards link to internal pages, not Instagram", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/#offers`);

      const offerCards = page.locator(
        '[data-testid="offers"] a[href^="/offers/"]',
      );
      const count = await offerCards.count();
      expect(count).toBe(3);

      // Verify no Instagram links in offers section
      const instagramLinks = page.locator(
        '[data-testid="offers"] a[href*="instagram.com/stories"]',
      );
      await expect(instagramLinks).toHaveCount(0);

      // Verify each card links to correct internal page
      for (const offer of offers) {
        const card = page.locator(
          `[data-testid="offers"] a[href="/offers/${offer.slug}"]`,
        );
        await expect(card).toBeVisible();
      }
    });

    test("clicking offer card navigates to offer page", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/#offers`);

      const firstCard = page
        .locator('[data-testid="offers"] a[href^="/offers/"]')
        .first();
      await firstCard.click();

      await expect(page).toHaveURL(/\/offers\/.+/);
    });
  });

  test.describe("Offer Pages", () => {
    for (const offer of offers) {
      test(`${offer.slug} page renders correctly`, async ({
        page,
        baseURL,
      }) => {
        await page.goto(`${baseURL}/offers/${offer.slug}`);

        // Verify page title
        await expect(page).toHaveTitle(new RegExp(offer.title));

        // Verify main heading
        const heading = page.locator("main h1");
        await expect(heading).toContainText(offer.title);

        // Verify tags are displayed
        const tags = page.locator("main header span");
        const tagCount = await tags.count();
        expect(tagCount).toBeGreaterThan(0);

        // Verify content sections exist
        await expect(page.locator("main h2").first()).toBeVisible();

        // Verify CTA section
        await expect(page.getByText("Zainteresowany/a?")).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Umów spotkanie" }),
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "Napisz maila" }),
        ).toBeVisible();
      });
    }

    test("back navigation returns to offers section", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);

      // Click back link in article (not nav menu)
      const backLink = page.locator('main a[href="/#offers"]').first();
      await expect(backLink).toBeVisible();
      await backLink.click();

      await expect(page).toHaveURL(`${baseURL}/#offers`);
    });

    test("Calendly popup opens on meeting button click", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);

      const meetingButton = page.getByRole("button", {
        name: "Umów spotkanie",
      });
      await meetingButton.click();

      const calendlyPopup = await page.waitForSelector(
        ".calendly-popup-content",
      );
      expect(calendlyPopup).toBeTruthy();

      const dataUrl = await calendlyPopup.getAttribute("data-url");
      expect(dataUrl).toContain(
        "https://calendly.com/michalina_graczyk/konsultacje",
      );

      const mixpanelEventsTracked = await getTrackedEvents(page);
      expectLastEventToBeTracked(
        mixpanelEventsTracked,
        "Offer booking clicked",
      );
    });

    test("email button has correct href and tracks event", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);

      const emailButton = page.getByRole("link", { name: "Napisz maila" });
      const href = await emailButton.getAttribute("href");
      expect(href).toBe("mailto:michalina@graczyk.dev");

      await emailButton.click();

      const mixpanelEventsTracked = await getTrackedEvents(page);
      expectLastEventToBeTracked(mixpanelEventsTracked, "Offer email clicked");
    });

    test("JSON-LD structured data is present", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);

      // Find the Service schema (there's also a WebSite schema from Layout)
      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      const count = await jsonLdScripts.count();
      expect(count).toBeGreaterThanOrEqual(1);

      // Find and parse the Service schema
      let serviceData = null;
      for (let i = 0; i < count; i++) {
        const content = await jsonLdScripts.nth(i).textContent();
        const data = JSON.parse(content!);
        if (data["@type"] === "Service") {
          serviceData = data;
          break;
        }
      }

      expect(serviceData).not.toBeNull();
      expect(serviceData.name).toBe("Konsultacje online 1:1");
      expect(serviceData.provider.name).toBe("Michalina Graczyk");
    });
  });
});
