import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  doTransferFromDesktop,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_INVESTOR || 'ob_test_3xYoHcfrkxuOGNy8vILxh4';

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

test('Verify KYC as an investor', async ({ page, browser, isMobile }) => {
  test.slow(); // ~42.7s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

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

  await frame.getByLabel('Occupation').first().fill('Occupation');
  await frame.getByLabel('Employer').first().fill('Employer');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame.getByLabel('$100,001 - $200,000').first().check();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await page.waitForTimeout(1000); // eslint-disable-line playwright/no-wait-for-timeout
  await frame.getByLabel('$100,001 - $200,000').first().check();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame.getByLabel('Growth').first().click();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame.getByLabel('Moderate').first().click();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const noneBtn = frame
    .getByRole('button')
    .filter({ hasText: /none/i })
    .first();
  await noneBtn
    .waitFor({ state: 'attached', timeout: 2000 })
    .then(() => noneBtn.click());
  await page.waitForLoadState();

  await doTransferFromDesktop({
    page,
    frame,
    browser,
  });
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
