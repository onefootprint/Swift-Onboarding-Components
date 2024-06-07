import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick } from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC || process.env.NEXT_PUBLIC_E2E_TENANT_PK || 'ob_test_Gw8TsnS2xWOYazI0pugdxu';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': 'piip@onefootprint.com',
    'id.phone_number': '+15555550100',
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('Bootstrap show login with different #ci', async ({ page, isMobile }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Check that "Log in with a different account" is not visible
  await expect(frame.getByText('Log in with a different account')).toBeAttached();
  // Update, After this PR -> https://github.com/onefootprint/monorepo/pull/8201 the login with a different account will be visible
});
