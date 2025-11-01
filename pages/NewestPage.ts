import { expect, type Page, type Locator } from '@playwright/test';

export class NewestPage {
  readonly page: Page;
  readonly moreLink: Locator;
  readonly ageSpans: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ageSpans = page.locator('span.age');
    this.moreLink = page.getByRole('link', { name: 'More', exact: true });
  }

  /**
   * Navigates to the "newest" page.
   */
  async goto(): Promise<void> {
    await this.page.goto('https://news.ycombinator.com/newest');
  }

  /**
   * Loads pages and scrapes timestamps in a loop until it
   * has the desired number of articles.
   * @param articleCount - The target number of timestamps to retrieve.
   * @returns An array of numeric timestamps.
   */
  async getTimestampsForFirst(articleCount: number): Promise<number[]> {
    const allTimestamps: number[] = [];

    while (allTimestamps.length < articleCount) {
      const elementsOnPage: Locator[] = await this.ageSpans.all();

      for (const el of elementsOnPage) {
        const timestampString: string | null = await el.getAttribute('title');

        if (timestampString) {
          const timestamp = parseInt(timestampString.split(' ')[1], 10);
          allTimestamps.push(timestamp);
        } else {
          console.warn('Found an age element with no title attribute.');
        }

        if (allTimestamps.length === articleCount) {
          break;
        }
      }

      if (allTimestamps.length < articleCount) {
        if (await this.moreLink.isVisible()) {
          await this.moreLink.click();
          await this.page.waitForLoadState('networkidle');
        } else {
          console.warn(`Could not find the 'More' link. Validating with the ${allTimestamps.length} articles found.`);
          break;
        }
      }
    }

    return allTimestamps;
  }

  
}
