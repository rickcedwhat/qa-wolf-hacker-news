// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const { expect } = require("@playwright/test");

/**
 * This script navigates to Hacker News, scrapes the timestamps of the first 100 articles
 * on the "newest" page, and validates that they are sorted in descending order.
 */
async function sortHackerNewsArticles() {
  console.log("🚀 Starting Hacker News article validation...");

  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News "newest" page
  await page.goto("https://news.ycombinator.com/newest");

  // Locators based on your NewestPage.ts
  const moreLink = page.locator('a.morelink');
  const ageSpans = page.locator('span.age');
  const articleCount = 100;
  const allTimestamps = [];

  // Loop and scrape timestamps until the target count is reached.
  // This logic is now identical to your getTimestampsForFirst method.
  while (allTimestamps.length < articleCount) {
    const elementsOnPage = await ageSpans.all();

    for (const el of elementsOnPage) {
      const timestampString = await el.getAttribute('title');

      if (timestampString) {
        // Your exact logic for parsing the timestamp
        const timestamp = parseInt(timestampString.split(' ')[1], 10);
        allTimestamps.push(timestamp);
      } else {
        console.warn('⚠️ Found an age element with no title attribute.');
      }

      if (allTimestamps.length === articleCount) {
        break;
      }
    }

    if (allTimestamps.length < articleCount) {
      if (await moreLink.isVisible()) {
        await moreLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        console.warn(`Could not find the 'More' link. Validating with the ${allTimestamps.length} articles found.`);
        break;
      }
    }
  }

  // --- Validation Step ---
  // This logic is adapted directly from your hacker-news.spec.ts file.

  console.log(`\n🔎 Retrieved ${allTimestamps.length} articles. Now validating...`);

  // 1. Validate that EXACTLY 100 articles were found
  expect(allTimestamps.length, `Article count should be ${articleCount}`).toBe(articleCount);

  // 2. Validate the sorting order
  for (let i = 0; i < allTimestamps.length - 1; i++) {
    const currentTime = allTimestamps[i];
    const nextTime = allTimestamps[i + 1];

    // Assert that the current article's timestamp is greater than or equal to the next one
    expect(currentTime, `Article at index ${i} is out of order.`).toBeGreaterThanOrEqual(nextTime);
  }

  console.log(`✅ Success! Validated that the first ${articleCount} articles are sorted correctly from newest to oldest.`);

  // Close browser
  await browser.close();
}

(async () => {
  try {
    await sortHackerNewsArticles();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed with an error:");
    console.error(error.message); // Log only the error message for cleaner output
    process.exit(1);
  }
})();