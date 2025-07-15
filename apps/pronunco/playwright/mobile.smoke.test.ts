import { test, expect } from '@playwright/test';

test.describe('Mobile view', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Deck list renders as cards', async ({ page }) => {
    await page.goto('/pc/m/decks');
    await expect(page.locator('h2')).toHaveText('Decks');
    const cards = await page.locator('.bg-white.shadow-md.rounded-lg').count();
    expect(cards).toBeGreaterThan(0);
  });

  test('Coach page has visible prompt', async ({ page }) => {
    // First, navigate to decks and click the first play button to navigate to the coach page
    await page.goto('/pc/m/decks');
    await page.locator('a:has-text("▶ Play")').first().click();

    // Now on the coach page, check for the prompt
    await expect(page.locator('.text-2xl.font-bold')).toBeVisible();
  });
});
