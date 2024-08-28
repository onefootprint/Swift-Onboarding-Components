import { expect, test } from '@playwright/test';
import {
  clickOnAgree,
  clickOnContinue,
  continueOnDesktop,
  doTransferFromMobile,
  selectOutcomeOptional,
  uploadImage,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_DOC_FIRST || 'pb_test_ZeSUWIlEteLWZByDjLITUL';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': 'piip@onefootprint.com',
    'id.phoneNumber': '+15555550100',
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

test('reverse-doc #ci', async ({ browser, isMobile, page }) => {
  test.slow(); // ~16.0s
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const context = await browser.newContext({ permissions: ['camera'] });

  await context.grantPermissions(['camera']);

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await expect(frame.locator('input[type="tel"]')).not.toBeAttached();

  if (isMobile /* eslint-disable-line playwright/no-conditional-in-test*/) {
    const newPage = await doTransferFromMobile({
      frame,
      browser,
    });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await newPage.waitForTimeout(5000); // takes 3 seconds for the new tab to close
    return;
  }

  await page.waitForLoadState();
  await expect(frame.getByText(/Continue on your mobile phone/i)).toBeVisible({
    timeout,
  });
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
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-back.png');
  await clickOnContinue(frame);
  expect(1).toBe(1);
});
