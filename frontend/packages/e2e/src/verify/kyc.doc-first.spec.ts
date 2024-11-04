import { expect, test } from '@playwright/test';
import {
  clickOnAgree,
  clickOnContinue,
  continueOnDesktop,
  selectOutcomeOptional,
  uploadImage,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_DOC_FIRST || 'pb_test_HMo2GpDNb4HIGWdhk1RfAX';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': PERSONAL.email,
    'id.phoneNumber': `+${PERSONAL.phone}`,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('Document first #ci', async ({ isMobile, page }) => {
  test.slow(); // ~16.0s
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await continueOnDesktop(frame);
  await page.waitForLoadState();

  const scanText = frame.getByText(/capture or upload/i).first();
  await scanText.waitFor({ state: 'attached', timeout: 3000 });

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame
    .getByText(/Optional/i)
    .first()
    .scrollIntoViewIfNeeded();

  await clickOnAgree(frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-front.png');
  await expect(frame.getByText('Success!').first()).toBeAttached({ timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-back.png');
  await expect(frame.getByText('Success!').first()).toBeAttached({ timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText("What's your Social Security Number?").first()).toBeAttached();
});
