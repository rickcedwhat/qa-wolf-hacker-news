import { test, expect } from '@playwright/test';
import { NewestPage } from '../pages/NewestPage';

const articlesToValidate: number = parseInt(process.env.ARTICLE_COUNT || '100', 10);

test.describe('Feature: Hacker News Article Sorting', () => {

  test(`Scenario: The first ${articlesToValidate} articles are sorted from newest to oldest`, async ({ page }) => {
    
    const newestPage = new NewestPage(page);
    let articleTimestamps: number[] = [];

    await test.step('Given I am on the Hacker News "newest" page', async () => {
      await newestPage.goto();
    });

    await test.step(`When I retrieve the timestamps of the first ${articlesToValidate} articles`, async () => {
      articleTimestamps = await newestPage.getTimestampsForFirst(articlesToValidate);
    });

    await test.step('Then the articles should be sorted in descending order of time', async () => {
      for (let i = 0; i < articleTimestamps.length - 1; i++) {
        const currentTime: number = articleTimestamps[i]; 
        const nextTime: number = articleTimestamps[i + 1];
        
      expect(currentTime,`Article ${String(i).padStart(4,"0")} - Current time: ${currentTime} should be greater than or equal to nextTime: ${nextTime}`).toBeGreaterThanOrEqual(nextTime);
      }
      
      console.log(`Successfully validated that the first ${articlesToValidate} articles are sorted correctly.`);
    });
  });
});
