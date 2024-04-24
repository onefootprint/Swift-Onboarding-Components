import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  clickOnAgree,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  continueOnDesktop,
  uploadImage,
  verifyPhoneNumber,
  verifyAppIframeClick,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_DOC || 'ob_test_0DNRM31nSBCSqHLJQTeWi9';

const firstName = 'Jane';
const lastName = 'Doe';
const dob = '01/01/1990';
const email = 'janedoe@acme.com';
const phoneNumber = '5555550100';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';
const ssn = '418437970';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/verify?ob_key=${key}&app_url=${appUrl}&f=${flowId}`,
  );
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('E2E.KYC.DriverDocOnly #ci', async ({ page, browser, isMobile }) => {
  test.slow(); // ~30.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const context = await browser.newContext({ permissions: ['camera'] });

  await expect(
    page
      .frameLocator('iframe[name^="footprint-iframe-"]')
      .getByText(/Sandbox Mode/i),
  ).toBeVisible({ timeout });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillEmail(frame, email);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillPhoneNumber(frame, phoneNumber);
  await clickOnVerifyWithSms(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await fillNameAndDoB(frame, { firstName, lastName, dob });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddress({ frame, page }, { addressLine1, city, zipCode });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillSSN(frame, { ssn });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await confirmData(frame, {
    firstName,
    lastName,
    dob,
    addressLine1,
    city,
    state: 'AL',
    zipCode,
    country: 'US',
    ssn,
  });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await continueOnDesktop(frame);
  await page.waitForLoadState();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame
    .getByText(/Optional/i)
    .first()
    .scrollIntoViewIfNeeded();

  await clickOnAgree(frame);
  await page.waitForLoadState();

  await uploadImage(
    { frame, page, isMobile },
    /Choose file to upload/i,
    'driver-front.png',
  );
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await uploadImage(
    { frame, page, isMobile },
    /Choose file to upload/i,
    'driver-back.png',
  );
  await clickOnContinue(frame);

  await context.close();
  return expect(1).toBe(1);
});
