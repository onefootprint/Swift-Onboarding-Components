import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from '../utils/commands';
import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC || 'pb_test_MrO9iLr9QyJ25GwIeJDdCV';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.dob': PERSONAL.dob,
    'id.email': PERSONAL.email,
    'id.first_name': PERSONAL.firstName,
    'id.last_name': PERSONAL.lastName,
    'id.middle_name': PERSONAL.middleName,
    'id.phone_number': `+${PERSONAL.phone}`,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYC bootstrap:residential page #ci', async ({ page, isMobile }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Check that "Log in with a different account" is visible
  await expect(frame.getByText('Log in with a different account')).toBeAttached();
  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await expect(frame.getByText("What's your residential address?").first()).toBeAttached();
});
