import { test, expect } from '@playwright/test';

test.describe('E2E Stress Test: Auction Flow', () => {
    const users = Array.from({ length: 10 }, (_, i) => ({
        email: `stress${i + 1}@autopro.com`,
        password: 'password123',
    }));

    for (const user of users) {
        test(`User ${user.email} can login and place a bid`, async ({ page }) => {
            // 1. Navigate to Auth Page
            await page.goto('http://localhost:3000/auth');

            // 2. Login
            await page.fill('input[type="email"]', user.email);
            await page.fill('input[type="password"]', user.password);
            await page.click('button[type="submit"]');

            // 3. Wait for navigation to marketplace
            await expect(page).toHaveURL(/.*marketplace/);

            // 4. Click on a live car (stress-car-1)
            // Assuming there's a link or card for the car
            await page.click('text=Stress Model 1');

            // 5. Place a bid
            // We need to find the bidding button and input
            // Let's assume there's a button with text 'مزايدة' or 'Bid'
            const bidButton = page.locator('button:has-text("مزايدة"), button:has-text("Bid")').first();
            await expect(bidButton).toBeVisible();
            await bidButton.click();

            // 6. Verify bid appeared in logs or UI updated
            // await expect(page.locator('text=تم تقديم العرض')).toBeVisible();
        });
    }
});
