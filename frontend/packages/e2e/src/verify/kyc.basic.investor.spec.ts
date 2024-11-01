import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';
import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_INVESTOR || 'pb_test_K8TrGHZFyrw6tXRSTIs0pT';

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
    'id.middle_name': PERSONAL.middleName,
    'id.phone_number': `+${PERSONAL.phone}`,
    'id.ssn9': PERSONAL.ssn,
    'id.state': PERSONAL.state,
    'id.zip': PERSONAL.zipCode,
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

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await confirmData(frame, {
    addressLine1: PERSONAL.addressLine1,
    city: PERSONAL.city,
    country: PERSONAL.country,
    dob: PERSONAL.dob,
    firstName: PERSONAL.firstName,
    lastName: PERSONAL.lastName,
    ssn: PERSONAL.ssn,
    state: PERSONAL.state,
    zipCode: PERSONAL.zipCode,
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
