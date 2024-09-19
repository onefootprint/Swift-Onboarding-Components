import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddressKYB,
  fillBasicDataKYB,
  fillBeneficialOwners,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB || 'pb_test_LMYOJWABaBuuXdHdkqYhWp';

const firstName = 'E2E';
const middleName = 'T';
const lastName = 'KYB';
const dob = '01/01/1990';
const ssn = '418437970';
const addressLine1 = '123 Main St';
const addressLine2 = 'Apt 1';
const city = 'San Francisco';
const state = 'CA';
const zipCode = '94105';
const country = 'US';

const userTIN = '123456789';
const beneficialOwner1Name = 'Bob';
const beneficialOwner1LastName = 'Lee';
const beneficialOwner1Email = 'boblee@acme.com';
const beneficialOwner1Phone = '6105579459';
const businessName = 'Business name';
const businessNameOptional = 'Optional name';

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
    'id.ssn9': ssn,
    'id.state': state,
    'id.zip': zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&bootstrap_data=${userData}&app_url=${appUrl}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB basic #ci', async ({ page, isMobile }) => {
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

  const basicH2 = frame.getByText('Basic data').first();
  await basicH2.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
