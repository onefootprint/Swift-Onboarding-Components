import { expect, test } from '@playwright/test';

import {
  clickOnAgree,
  clickOnContinue,
  confirmData,
  continueOnDesktop,
  selectOutcomeOptional,
  uploadImage,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_DOC || 'ob_test_0DNRM31nSBCSqHLJQTeWi9';

const firstName = 'E2E';
const middleName = 'T';
const lastName = 'Doc';
const dob = '01/01/1990';
const addressLine1 = '123 Main St';
const addressLine2 = 'Apt 1';
const city = 'San Francisco';
const state = 'CA';
const zipCode = '94105';
const country = 'US';
const ssn9 = '123412345';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.address_line1': addressLine1,
    'id.address_line2': addressLine2,
    'id.city': city,
    'id.country': country,
    'id.dob': dob,
    'id.email': 'piip@onefootprint.com',
    'id.first_name': firstName,
    'id.last_name': lastName,
    'id.middle_name': middleName,
    'id.phone_number': '+15555550100',
    'id.ssn9': ssn9,
    'id.state': state,
    'id.zip': zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&f=${flowId}&bootstrap_data=${userData}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('E2E.KYC.DriverDocOnly #ci', async ({ page, browser, isMobile }) => {
  test.slow(); // ~30.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const context = await browser.newContext({ permissions: ['camera'] });

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await confirmData(frame, {
    addressLine1,
    city,
    country: 'US',
    dob,
    firstName,
    lastName,
    ssn: ssn9,
    state: 'AL',
    zipCode,
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

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-front.png');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-back.png');
  await clickOnContinue(frame);

  await context.close();
  return expect(1).toBe(1);
});
