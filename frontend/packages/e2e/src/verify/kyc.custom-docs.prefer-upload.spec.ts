import { expect, test } from '@playwright/test';

import {
  clickOn,
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  uploadImage,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_CUSTOM_DOC || 'pb_test_U8RCDBPSmdBmXhyCXa7r5d';

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

test('E2E.KYC.CustomDoc.PreferUpload #ci', async ({ page, isMobile }) => {
  test.slow(); // ~30.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = 5000;

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

  await clickOn(/continue on mobile instead/i, frame);
  await page.waitForLoadState();

  await clickOn(/continue on desktop/i, frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /upload file/i, 'driver-front.png');
  await page.waitForLoadState();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  return expect(1).toBe(1);
});
