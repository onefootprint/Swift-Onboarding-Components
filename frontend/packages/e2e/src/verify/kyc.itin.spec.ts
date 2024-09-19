import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillTaxId,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_ITIN || 'pb_test_84lqIB3DpsQUKgEQhAKGEt';

const firstName = 'E2E';
const middleName = 'M';
const lastName = 'Doe';
const dob = '01/01/1990';
const addressLine1 = '123 Main St';
const addressLine2 = 'Apt 1';
const city = 'San Francisco';
const state = 'CA';
const zipCode = '94105';
const country = 'US';

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

test('KYC ITIN/ITIN #ci', async ({ page, isMobile }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Log in with a different account')).toBeAttached();
  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await expect(frame.getByText('Tax ID').first()).toBeAttached();
  await fillTaxId(frame, { id: '900801234' });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Confirm your personal data').first()).toBeAttached();
  await frame.getByRole('button').filter({ hasText: 'Reveal' }).first().click();
  await expect(frame.getByText('900-80-1234').first()).toBeAttached();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Add a passkey').first()).toBeAttached();
});

test('KYC ITIN/SSN #ci', async ({ page, isMobile }) => {
  test.slow();
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

  await expect(frame.getByText('Tax ID').first()).toBeAttached();
  await fillTaxId(frame, { id: '418437970' });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Confirm your personal data').first()).toBeAttached();
  await frame.getByRole('button').filter({ hasText: 'Reveal' }).first().click();
  await expect(frame.getByText('418-43-7970').first()).toBeAttached();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Add a passkey').first()).toBeAttached();
});
