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
import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_HOSTED_BASE_URL || 'http://localhost:3004';
const key = process.env.E2E_OB_KYC || 'pb_test_MrO9iLr9QyJ25GwIeJDdCV';

test('Hosted KYC #ci', async ({ browserName, isMobile, page }) => {
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

  await fillEmail(page, PERSONAL.email);
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillPhoneNumber(page, PERSONAL.phoneWithoutCountryCode);
  await clickOnVerifyWithSms(page);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame: page, page });
  await page.waitForLoadState();

  await fillNameAndDoB(page, { firstName: PERSONAL.firstName, lastName: PERSONAL.lastName, dob: PERSONAL.dob });
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillAddress(
    { frame: page, page },
    { addressLine1: PERSONAL.addressLine1, city: PERSONAL.city, zipCode: PERSONAL.zipCode },
  );
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillSSN(page, { ssn: PERSONAL.ssn });
  await clickOnContinue(page);
  await page.waitForLoadState();

  await confirmData(page, {
    firstName: PERSONAL.firstName,
    lastName: PERSONAL.lastName,
    dob: PERSONAL.dob,
    addressLine1: PERSONAL.addressLine1,
    city: PERSONAL.city,
    state: PERSONAL.state,
    zipCode: PERSONAL.zipCode,
    country: PERSONAL.country,
    ssn: PERSONAL.ssn,
  });
  await clickOnContinue(page);
  await page.waitForLoadState();

  await expect(page.getByText('Add a passkey').first()).toBeAttached();
});
