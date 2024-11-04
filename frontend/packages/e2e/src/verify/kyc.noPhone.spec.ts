import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyEmail,
} from '../utils/commands';

import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_NO_PHONE || 'pb_test_uDiD4cdG8iNsIXF2JjemAJ';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.address_line1': PERSONAL.addressLine1,
    'id.address_line2': PERSONAL.addressLine2,
    'id.city': PERSONAL.city,
    'id.country': PERSONAL.country,
    'id.dob': PERSONAL.dob,
    'id.email': PERSONAL.email,
    'id.first_name': PERSONAL.firstName,
    'id.last_name': PERSONAL.lastName,
    'id.phone_number': `+${PERSONAL.phone}`,
    'id.ssn9': PERSONAL.ssn,
    'id.state': PERSONAL.state,
    'id.zip': PERSONAL.zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&bootstrap_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYC E2E.NoPhoneFlow #ci', async ({ page, isMobile }) => {
  test.slow(); // ~16.0s
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyEmail({ frame, page });
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

  return expect(frame.getByTestId('result').innerText).toBeDefined();
});
