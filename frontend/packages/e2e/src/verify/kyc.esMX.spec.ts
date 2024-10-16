import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  fillAddress,
  fillNameAndDoB,
  fillPhoneNumber,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_ES || 'ob_test_yHlPBcaJ6lnxwkkD1YLStx';
const locale = 'es-MX';

const firstName = 'E2E';
const lastName = 'es-MX';
const dob = '25/12/1990';
const email = 'jorge@mejia.com';
const phoneNumber = '5555550100';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';

const userData = encodeURIComponent(JSON.stringify({ 'id.email': email }));

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/verify?ob_key=${key}&locale=${locale}&app_url=${appUrl}&bootstrap_data=${userData}&f=${flowId}`,
  );
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('E2E.es-MX.KYC.Docs #ci', async ({ isMobile, page }) => {
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

  await frame.getByRole('button').filter({ hasText: '+52' }).first().click();
  await page.keyboard.press('u');
  await page.keyboard.press('n');
  await page.keyboard.press('i');
  await page.keyboard.press('t');
  await page.keyboard.press('Enter');

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

  await confirmData(frame, {
    firstName,
    lastName,
    dob,
    addressLine1,
    city,
    state: 'AL',
    zipCode,
    country: 'US',
  });
});
