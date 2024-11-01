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
} from '../utils/commands';
import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC || 'pb_test_MrO9iLr9QyJ25GwIeJDdCV';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('Verify KYC #ci', async ({ page, browser, isMobile }) => {
  test.slow(); // ~29.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillEmail(frame, PERSONAL.email);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillPhoneNumber(frame, PERSONAL.phoneWithoutCountryCode);
  await clickOnVerifyWithSms(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await fillNameAndDoB(frame, { firstName: PERSONAL.firstName, lastName: PERSONAL.lastName, dob: PERSONAL.dob });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddress(
    { frame, page },
    { addressLine1: PERSONAL.addressLine1, city: PERSONAL.city, zipCode: PERSONAL.zipCode },
  );
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillSSN(frame, { ssn: PERSONAL.ssn });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await confirmData(frame, {
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
