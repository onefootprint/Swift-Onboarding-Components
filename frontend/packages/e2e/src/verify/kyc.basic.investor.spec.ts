import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_INVESTOR || 'ob_test_3xYoHcfrkxuOGNy8vILxh4';

const firstName = 'E2E';
const middleName = 'T';
const lastName = 'Investor';
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
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('Verify KYC as an investor #ci', async ({ page, isMobile }) => {
  test.slow(); // ~42.7s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

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

  // Occupation
  await frame.getByLabel('Occupation').first().fill('Occupation');
  await frame.getByLabel('Employer').first().fill('Employer');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Annual income
  await frame.getByLabel('$100,001 - $200,000').first().check();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Net worth
  await frame.getByLabel('$200,001 - $500,000').first().check();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Funding sources
  await frame.getByLabel('Family').first().check();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Investment goals
  await frame.getByLabel('Growth').first().click();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Risk tolerance
  await frame.getByLabel('Moderate').first().click();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Declarations
  await clickOnContinue(frame);
  await page.waitForLoadState();

  // Confirm
  await expect(frame.getByText('$100,001 - $200,000')).toBeAttached();
  await expect(frame.getByText('$200,001 - $500,000')).toBeAttached();
  await expect(frame.getByText('Growth')).toBeAttached();
  await expect(frame.getByText('Moderate')).toBeAttached();
  await expect(frame.getByText('None')).toBeAttached();
  await expect(frame.getByText('Confirm & Continue')).toBeAttached();
});
