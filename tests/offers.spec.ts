import { expect, test } from "@playwright/test";
import {
  acceptConsentIfVisible,
  expectLastEventToBeTracked,
  getTrackedEvents,
  TrackingEvents,
} from "./helpers/mixpanel";

const offers = [
  {
    slug: "audyt-jakosci",
    title: "Audyt procesu jakości",
    mode: "booking" as const,
    audience: "team" as const,
  },
  {
    slug: "szkolenie-ai-w-qa",
    title: "Szkolenie: AI w pracy zespołu QA",
    mode: "booking" as const,
    audience: "team" as const,
  },
  {
    slug: "konsultacje",
    title: "Mentoring 1:1",
    mode: "waitlist" as const,
    audience: "individual" as const,
  },
];

const bookingOffers = offers.filter((offer) => offer.mode === "booking");
const waitlistOffers = offers.filter((offer) => offer.mode === "waitlist");

// The amber tokens the WaitlistBadge resolves to, per theme. Declared in the
// `@theme` block of `src/styles/global.css` — without them the badge renders
// unstyled and disappears against a white card.
const AMBER_BADGE_COLORS = [
  "rgb(180, 83, 9)", // amber-700, light mode
  "rgb(251, 191, 36)", // amber-400, dark mode
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
      await expect(offerCards).toHaveCount(offers.length);

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

    test("cards are grouped by audience, teams first", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/#offers`);
      await acceptConsentIfVisible(page);

      // Group order is a deliberate editorial choice: B2B offers lead, the
      // individual (1:1) track follows.
      const groups = page.locator('[data-testid^="offers-group-"]');
      await expect(groups).toHaveCount(2);
      expect(
        await groups.evaluateAll((els) =>
          els.map((el) => (el as HTMLElement).dataset.testid),
        ),
      ).toEqual(["offers-group-team", "offers-group-individual"]);

      for (const offer of offers) {
        await expect(
          page.locator(
            `[data-testid="offers-group-${offer.audience}"] a[href="/offers/${offer.slug}"]`,
          ),
        ).toBeVisible();
      }
    });

    test("waitlist card sorts after bookable cards", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/#offers`);
      await acceptConsentIfVisible(page);

      // A sold-out card between two bookable ones reads as a hole in the row.
      const slugs = await page
        .locator('[data-testid="offers"] a[href^="/offers/"]')
        .evaluateAll((els) =>
          els.map((el) => (el as HTMLAnchorElement).getAttribute("href")),
        );
      const lastSlug = slugs.at(-1);
      expect(waitlistOffers.map((o) => `/offers/${o.slug}`)).toContain(
        lastSlug,
      );
    });

    test("waitlist badge on the card is legible, not white on white", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/#offers`);
      await acceptConsentIfVisible(page);

      // Regression: `--color-*: initial` in `global.css` wipes the default
      // Tailwind palette, so the badge's amber utilities render as nothing
      // unless the amber tokens are declared in the `@theme` block. The badge
      // then inherited white and vanished on the white card.
      const badge = page
        .locator('[data-testid="card"] span', { hasText: "Waitlista" })
        .first();
      await expect(badge).toBeVisible();
      const color = await badge.evaluate(
        (el) => getComputedStyle(el).color as string,
      );
      // amber-700 in light mode, amber-400 in dark mode. Never plain white,
      // which is what the badge inherited while the tokens were missing.
      expect(AMBER_BADGE_COLORS).toContain(color);
    });

    test("offer cards have equal heights within a group on desktop", async ({
      page,
      baseURL,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${baseURL}/#offers`);
      await acceptConsentIfVisible(page);

      // Heights are only comparable inside a group: groups render at different
      // column widths by design (two-up for teams, single narrow card for 1:1).
      const teamCards = page.locator(
        '[data-testid="offers-group-team"] [data-testid="card"]',
      );
      const count = await teamCards.count();
      expect(count).toBe(
        offers.filter((offer) => offer.audience === "team").length,
      );

      const heights: number[] = [];
      for (let i = 0; i < count; i++) {
        const box = await teamCards.nth(i).boundingBox();
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

        // Verify the CTA block matches the offer's mode
        if (offer.mode === "waitlist") {
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
        } else {
          await expect(
            page.getByRole("heading", { name: "Zainteresowany/a?" }),
          ).toBeVisible();
          await expect(
            page.getByRole("link", { name: "Umów spotkanie" }),
          ).toBeVisible();
          await expect(
            page.getByRole("link", { name: "Dołącz do waitlisty" }),
          ).toHaveCount(0);
        }
      });
    }

    test("waitlist offers expose Waitlista tag with amber styling", async ({
      page,
      baseURL,
    }) => {
      expect(waitlistOffers.length).toBeGreaterThan(0);
      for (const offer of waitlistOffers) {
        await page.goto(`${baseURL}/offers/${offer.slug}`);
        await acceptConsentIfVisible(page);
        const tag = page
          .locator("main header span", { hasText: "Waitlista" })
          .first();
        await expect(tag).toBeVisible();
        // Same palette regression as the card badge: amber must resolve.
        const color = await tag.evaluate(
          (el) => getComputedStyle(el).color as string,
        );
        expect(AMBER_BADGE_COLORS).toContain(color);
      }
    });

    test("waitlist mode hides booking button on offer page", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/konsultacje`);
      await acceptConsentIfVisible(page);
      await expect(
        page.getByRole("link", { name: "Umów spotkanie" }),
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

    test("booking offer opens the booking link and tracks OFFER_BOOKING_CLICKED", async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/offers/${bookingOffers[0].slug}`);
      await acceptConsentIfVisible(page);

      const meetingLink = page.getByRole("link", {
        name: "Umów spotkanie",
      });
      await expect(meetingLink).toHaveAttribute(
        "href",
        "https://zcal.co/michalina-graczyk/pierwsza-konsultacja",
      );
      await expect(meetingLink).toHaveAttribute("target", "_blank");
      await expect(meetingLink).toHaveAttribute("rel", "noopener noreferrer");
      await meetingLink.click({ modifiers: ["Meta"] });

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

    test("booking offers do not advertise SoldOut in JSON-LD", async ({
      page,
      baseURL,
    }) => {
      for (const offer of bookingOffers) {
        await page.goto(`${baseURL}/offers/${offer.slug}`);
        await acceptConsentIfVisible(page);

        const jsonLdScripts = page.locator(
          'script[type="application/ld+json"]',
        );
        const count = await jsonLdScripts.count();
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
        expect(serviceData.name).toBe(offer.title);
        expect(serviceData.offers).toBeUndefined();
      }
    });
  });
});
