import { test, expect } from '@playwright/test';

test('should open the iframe', async ({ page, browserName }) => {
  await page.goto('http://localhost:3002');
  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  const iframe = await page.frameLocator('iframe');
  await iframe.getByLabel('Email').fill('lorem@onefootprint.com#123');
  await iframe.getByRole('button', { name: 'Continue' }).click();
  await page.screenshot({ path: `./tests/media/iframe-${browserName}.png` });
});
