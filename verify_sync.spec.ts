import { test, expect } from '@playwright/test';

test('verify synchronization and storage management', async ({ page }) => {
  // Increase timeout for synchronization
  test.setTimeout(60000);

  // 1. Visit the app
  await page.goto('http://localhost:3000');

  // 2. Wait for the initial load and check if we are on the dashboard or landing page
  // Since we have a userClubId persisted in some cases, it might go straight to dashboard.
  // If it's a fresh start, it might be the setup page.

  // Check if "Syncing Game State..." is visible (from App.tsx)
  const syncingText = page.locator('text=Syncing Game State...');
  if (await syncingText.isVisible()) {
      console.log('Syncing text visible, waiting for it to disappear...');
      await expect(syncingText).not.toBeVisible({ timeout: 30000 });
  }

  // 3. Verify localStorage size
  const storage = await page.evaluate(() => {
    const data = localStorage.getItem('chairman-game-storage');
    return data ? JSON.parse(data) : null;
  });

  console.log('LocalStorage content:', JSON.stringify(storage, null, 2));

  if (storage && storage.state) {
    // Large collections should be absent
    expect(storage.state.players).toBeUndefined();
    expect(storage.state.clubs).toBeUndefined();
    expect(storage.state.matches).toBeUndefined();
    expect(storage.state.news).toBeUndefined();

    // Key flags should be present
    expect(storage.state).toHaveProperty('hasActiveSession');
  }

  // 4. Verify that the app is functional after sync
  // Assuming if we are synced, we should see some club info or navigation
  await expect(page.locator('nav')).toBeVisible();

  // 5. Navigate to Boardroom and check if it loads (this verifies sync fetched enough data)
  const boardroomLink = page.locator('a:has-text("Boardroom")');
  if (await boardroomLink.isVisible()) {
      await boardroomLink.click();
      await expect(page.locator('text=Club Philosophy')).toBeVisible();
      console.log('Boardroom verified');
  } else {
      console.log('Boardroom link not found, might be in setup phase');
  }
});
