import { expect, test } from "@playwright/test";

test.describe("RSS Feed", () => {
  test("RSS endpoint returns valid XML with required elements", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(`${baseURL}/rss.xml`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/xml");

    const body = await response.text();

    // Check RSS 2.0 structure
    expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(body).toContain("<rss");
    expect(body).toContain("<channel>");

    // Check required channel elements
    expect(body).toContain("<title>Michalina Graczyk - Blog</title>");
    expect(body).toContain("<link>https://michalinqa.dev/</link>");
    expect(body).toContain("<description>");

    // Check that items have required elements
    expect(body).toContain("<item>");
    expect(body).toContain("<pubDate>");
  });

  test("RSS autodiscovery link is present in page head", async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL!);

    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute("rel", "alternate");
    await expect(rssLink).toHaveAttribute("href", "/rss.xml");
    await expect(rssLink).toHaveAttribute("title", "Michalina Graczyk - Blog");
  });

  test("RSS autodiscovery link is present on all pages", async ({
    page,
    baseURL,
  }) => {
    const pages = ["/", "/blog", "/cv"];

    for (const pagePath of pages) {
      await page.goto(`${baseURL}${pagePath}`);
      const rssLink = page.locator('link[type="application/rss+xml"]');
      await expect(rssLink).toHaveAttribute("href", "/rss.xml");
    }
  });
});
