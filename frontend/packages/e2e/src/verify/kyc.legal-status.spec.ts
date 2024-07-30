import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  doTransferFromDesktop,
  fillVisa,
  selectOutcomeOptional,
  softCheckSupport,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_LEGAL_STATUS || 'pb_test_jaZzYsm4aSPSY4YfH0qe7T';

const addressLine1 = '123 Main St';
const addressLine2 = 'Apt 1';
const city = 'San Francisco';
const country = 'US';
const dob = '01/01/1990';
const email = 'janedoe@acme.com';
const firstName = 'E2E';
const lastName = 'LegalStatus';
const ssn = '418437970';
const state = 'CA';
const zipCode = '94105';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.address_line1': addressLine1,
    'id.address_line2': addressLine2,
    'id.city': city,
    'id.country': country,
    'id.dob': dob,
    'id.email': email,
    'id.first_name': firstName,
    'id.last_name': lastName,
    'id.phone_number': '+15555550100',
    'id.ssn9': ssn,
    'id.state': state,
    'id.zip': zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&bootstrap_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYC with US legal status #ci', async ({ page, browser, isMobile }) => {
  test.slow(); // ~31.0s
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (!isMobile) {
    await softCheckSupport(frame);
  }
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await fillVisa({ frame, page });
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
    citizenship: 'Afghanistan',
    nationality: 'Afghanistan',
    usLegalStatus: 'Visa',
    visaKind: 'E-1',
    visaExpirationDate: '01/01/2024',
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
