import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key =
  process.env.E2E_OB_KYC ||
  process.env.NEXT_PUBLIC_E2E_TENANT_PK ||
  'ob_test_Gw8TsnS2xWOYazI0pugdxu';

const firstName = 'John';
const lastName = 'Doe';
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
    'id.email': 'piip@onefootprint.com',
    'id.phone_number': '+15555550100',
    'id.first_name': firstName,
    'id.last_name': lastName,
    'id.dob': dob,
    'id.address_line1': addressLine1,
    'id.address_line2': addressLine2,
    'id.city': city,
    'id.state': state,
    'id.zip': zipCode,
    'id.country': country,
    'id.ssn9': ssn9,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`,
  );
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYC with bootstrap #ci', async ({ page, isMobile }) => {
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

  // Check that "Log in with a different account" is visible
  await expect(
    frame.getByText('Log in with a different account'),
  ).toBeAttached();
  await verifyPhoneNumber({ frame, page });

  await page.waitForLoadState();

  await confirmData(frame, {
    firstName,
    lastName,
    dob,
    addressLine1,
    addressLine2,
    city,
    state: 'AL',
    country,
    zipCode,
    ssn: ssn9,
  });

  await clickOnContinue(frame);
  await page.waitForLoadState();

  return expect(1).toBe(1);
});
