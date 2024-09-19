import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_HOSTED_BASE_URL || 'http://localhost:3004';
const key = process.env.E2E_OB_KYC || process.env.NEXT_PUBLIC_E2E_TENANT_PK || 'ob_test_Gw8TsnS2xWOYazI0pugdxu';

const firstName = 'E2E';
const lastName = 'KYCBasic';
const dob = '01/01/1990';
const email = 'janedoe@acme.com';
const phoneNumber = '5555550100';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';
const ssn = '418437970';

test('Hosted KYC #ci ', async ({ browserName, isMobile, page }) => {
  test.slow(); // ~15s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`${appUrl}?type=ob_pk&f=${flowId}#${key}`);
  await page.waitForLoadState();

  const btnVerify = page.getByRole('button', { name: 'Verify your identity' });
  await btnVerify.waitFor({ state: 'attached', timeout });
  await btnVerify.first().click();
  await page.waitForLoadState();

  await selectOutcomeOptional(page, 'Success');
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillEmail(page, email);
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillPhoneNumber(page, phoneNumber);
  await clickOnVerifyWithSms(page);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame: page, page });
  await page.waitForLoadState();

  await fillNameAndDoB(page, { firstName, lastName, dob });
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillAddress({ frame: page, page }, { addressLine1, city, zipCode });
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillSSN(page, { ssn });
  await clickOnContinue(page);
  await page.waitForLoadState();

  await confirmData(page, {
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
  await clickOnContinue(page);
  await page.waitForLoadState();

  await expect(page.getByText('Add a passkey').first()).toBeAttached();
});
