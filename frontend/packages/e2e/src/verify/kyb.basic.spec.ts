import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  doTransferFromDesktop,
  fillAddress,
  fillAddressKYB,
  fillBasicDataKYB,
  fillBeneficialOwners,
  fillEmail,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB || 'pb_test_LMYOJWABaBuuXdHdkqYhWp';

const firstName = 'E2E';
const lastName = 'KYB';
const dob = '01/01/1990';
const email = 'janedoe@acme.com';
const phoneNumber = '5555550100';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';
const ssn = '418437970';

const userTIN = '123456789';
const beneficialOwner1Name = 'Bob';
const beneficialOwner1LastName = 'Lee';
const beneficialOwner1Email = 'boblee@acme.com';
const beneficialOwner1Phone = '6105579459';
const businessName = 'Business name';
const businessNameOptional = 'Optional name';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB verification #ci', async ({ browser, page, isMobile }) => {
  test.slow(); // ~48.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
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

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillBasicDataKYB(frame, {
    businessName,
    businessNameOptional,
    userTIN,
  });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddressKYB({ frame, page }, { addressLine1, city, zipCode });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillBeneficialOwners(frame, {
    beneficialOwner1Email,
    beneficialOwner1LastName,
    beneficialOwner1Name,
    beneficialOwner1Phone,
    userFirstName: firstName,
    userLastName: lastName,
  });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);
  await clickOnContinue(frame);
  await page.waitForLoadState();
  // #endregion

  const basicH2 = frame.getByText('Basic data').first();
  await basicH2.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  const dobField = frame.getByLabel('Date of Birth').first();
  await dobField.waitFor({ state: 'attached', timeout: 3000 });
  await dobField.fill(dob);

  await clickOnContinue(frame);
  await page.waitForLoadState();
  // #endregion

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

  await doTransferFromDesktop({
    page,
    frame,
    browser,
  });
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
