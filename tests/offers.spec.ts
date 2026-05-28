import { expect, test } from "@playwright/test";
import {
  acceptConsentIfVisible,
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

const offers = [
  {
    slug: "konsultacje",
    title: "Mentoring 1:1",
    mode: "waitlist" as const,
  },
];

// Default subject derived from title (mirrors `buildWaitlistSubject` in
// `src/lib/offers.ts`). Frontmatter no longer hard-codes this.
const defaultWaitlistSubject = (title: string) => `Waitlista - ${title}`;

test.describe("Offers", () => {
  test.describe("Homepage Offer Cards", () => {
    test("offer cards link to internal pages", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/#offers`);
      await acceptConsentIfVisible(page);

      const offerCards = page.locator(
        '[data-testid="offers"] a[href^="/offers/"]',
      );
      const count = await offerCards.count();
      expect(count).toBe(1);

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
      await acceptConsentIfVisible(page);

      const firstCard = page
        .locator('[data-testid="offers"] a[href^="/offers/"]')
        .first();
      await firstCard.click();

      await expect(page).toHaveURL(/\/offers\/.+/);
    });

    test("offer cards have equal heights on desktop", async ({
      page,
      baseURL,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${baseURL}/#offers`);
      await acceptConsentIfVisible(page);

      const cards = page.locator('[data-testid="card"]');
      const count = await cards.count();
      expect(count).toBe(1);

      const heights: number[] = [];
      for (let i = 0; i < count; i++) {
        const box = await cards.nth(i).boundingBox();
        expect(box).not.toBeNull();
        heights.push(box!.height);
      }

      // All cards should have equal height (within 1px tolerance for rounding)
      const maxHeight = Math.max(...heights);
      const minHeight = Math.min(...heights);
      expect(maxHeight - minHeight).toBeLessThanOrEqual(1);
    });
  });

  test.describe("Offer Pages", () => {
    for (const offer of offers) {
      test(`${offer.slug} page renders correctly`, async ({
        page,
        baseURL,
      }) => {
        await page.goto(`${baseURL}/offers/${offer.slug}`);
        await acceptConsentIfVisible(page);

        // Verify page title
        const escapedTitle = offer.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await expect(page).toHaveTitle(new RegExp(escapedTitle));

        // Verify main heading
        const heading = page.locator("main h1");
        await expect(heading).toContainText(offer.title);

        // Verify tags are displayed
        const tags = page.locator("main header span");
        const tagCount = await tags.count();
        expect(tagCount).toBeGreaterThan(0);

        // Verify content sections exist
        await expect(page.locator("main h2").first()).toBeVisible();

        // Verify CTA section - waitlist mode for all current offers
        await expect(
          page.getByRole("heading", {
            name: "Zapisz się na listę oczekujących",
          }),
        ).toBeVisible();
        const waitlistButton = page.getByRole("link", {
          name: "Dołącz do waitlisty",
        });
        await expect(waitlistButton).toBeVisible();
        const href = await waitlistButton.getAttribute("href");
        expect(href).toContain("mailto:michalina@graczyk.dev");
        expect(href).toContain(
          `subject=${encodeURIComponent(defaultWaitlistSubject(offer.title))}`,
        );
        // RFC 6068: body line breaks must be `\n` (`%0A`). `%0D` (CR) leaks
        // into some clients as a visible artifact / double break.
        expect(href).not.toContain("%0D");
      });
    }

    test("waitlist offers expose Waitlista tag with amber styling", async ({
      page,
      baseURL,
    }) => {
      const waitlistOffers = offers.filter((o) => o.mode === "waitlist");
      expect(waitlistOffers.length).toBeGreaterThan(0);
      for (const offer of waitlistOffers) {
        await page.goto(`${baseURL}/offers/${offer.slug}`);
        await acceptConsentIfVisible(page);
        const tag = page
          .locator("main header span", { hasText: "Waitlista" })
          .first();
        await expect(tag).toBeVisible();
      }
    });

    test("waitlist mode hides Calendly button on offer page", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);
      await acceptConsentIfVisible(page);
      await expect(
        page.getByRole("button", { name: "Umów spotkanie" }),
      ).toHaveCount(0);
      await expect(page.getByText("Zainteresowany/a?")).toHaveCount(0);
    });

    test("back navigation returns to offers section", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);
      await acceptConsentIfVisible(page);

      // Click back link in article (not nav menu)
      const backLink = page.locator('main a[href="/#offers"]').first();
      await expect(backLink).toBeVisible();
      await backLink.click();

      await expect(page).toHaveURL(`${baseURL}/#offers`);
    });

    test("booking CTA absent while all offers are in waitlist mode", async ({
      page,
      baseURL,
    }) => {
      // Negative regression: in the current waitlist-only state the Calendly
      // CTA must not be reachable from any offer page.
      await page.goto(`${baseURL}/offers/konsultacje`);
      await acceptConsentIfVisible(page);
      await expect(
        page.getByRole("button", { name: "Umów spotkanie" }),
      ).toHaveCount(0);
    });

    // Real booking-mode coverage (Calendly popup interaction +
    // OFFER_BOOKING_CLICKED tracking). Kept as `fixme` so it stays visible in
    // the report instead of being silently deleted. Re-enable once a
    // `mode: "booking"` offer (or test fixture) ships again.
    test.fixme("booking offer opens Calendly popup and tracks OFFER_BOOKING_CLICKED", async ({
      page,
      baseURL,
    }) => {
      // TODO(booking): point this at a real `mode: "booking"` offer slug.
      await page.goto(`${baseURL}/offers/<booking-slug>`);
      await acceptConsentIfVisible(page);

      const meetingButton = page.getByRole("button", {
        name: "Umów spotkanie",
      });
      await meetingButton.click();

      await page.waitForSelector(".calendly-popup-content");

      const mixpanelEventsTracked = await getTrackedEvents(page);
      expectLastEventToBeTracked(
        mixpanelEventsTracked,
        TrackingEvents.OFFER_BOOKING_CLICKED,
      );
    });

    test("waitlist email button has correct mailto and tracks event", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);
      await acceptConsentIfVisible(page);

      const waitlistButton = page.getByRole("link", {
        name: "Dołącz do waitlisty",
      });
      const href = await waitlistButton.getAttribute("href");
      expect(href).toContain("mailto:michalina@graczyk.dev");
      expect(href).toContain("subject=Waitlista");
      // Body uses `\n` (RFC 6068), never `\r\n`.
      expect(href).not.toContain("%0D");

      await waitlistButton.click();

      const mixpanelEventsTracked = await getTrackedEvents(page);
      expectLastEventToBeTracked(
        mixpanelEventsTracked,
        TrackingEvents.OFFER_WAITLIST_CLICKED,
      );
    });

    test("JSON-LD structured data is present", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);
      await acceptConsentIfVisible(page);

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
      expect(serviceData.name).toBe("Mentoring 1:1");
      expect(serviceData.provider.name).toBe("Michalina Graczyk");
      // Waitlist mode must surface as SoldOut so Google rich results don't
      // advertise the service as available.
      expect(serviceData.offers).toMatchObject({
        "@type": "Offer",
        availability: "https://schema.org/SoldOut",
      });
    });
  });
});
