import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_ID_PHONE_EMAIL || 'pb_test_s1295ljZR1lZ0ZZr42iDzO';

const email = 'sandbox@onefootprint.com' as const;
const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': email,
    'id.phone_number': '+15555550100',
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&bootstrap_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('ID bootstrap verify phone email #ci', async ({ page, isMobile }) => {
  test.slow();
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Verify your phone number')).toBeAttached();
  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await expect(frame.getByText('Verify your email address')).toBeAttached();
});
