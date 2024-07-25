import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick } from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC || process.env.NEXT_PUBLIC_E2E_TENANT_PK || 'ob_test_Gw8TsnS2xWOYazI0pugdxu';

const numberOfTests = 2;
const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': 'piip@onefootprint.com',
    'id.phone_number': '+15555550100',
  }),
);

for (let i = 0; i < numberOfTests; i++) {
  test(`E2E.Bootstrap ${i} #stress`, async ({ browserName, page, isMobile }) => {
    test.setTimeout(120000);
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
    await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`);
    await page.waitForLoadState();

    await verifyAppIframeClick(page, isMobile);
    await page.waitForLoadState();

    const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

    await selectOutcomeOptional(frame, 'Success');
    await clickOnContinue(frame);
    await page.waitForLoadState();

    await expect(frame.getByText('Log in with a different account')).toBeAttached();
  });
}
