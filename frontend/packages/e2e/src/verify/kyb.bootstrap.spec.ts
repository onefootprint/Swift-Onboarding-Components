import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillBusinessOwners,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';
import { BUSINESS, PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB || 'pb_test_irxUbxvVOevFXVmhIvHdrf';

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
    'business.name': BUSINESS.name,
    'business.dba': BUSINESS.dba,
    'business.tin': BUSINESS.tin,
    'business.corporation_type': BUSINESS.corporationType,
    'business.website': BUSINESS.website,
    'business.phone_number': `+${BUSINESS.phoneNumber}`,
    'business.address_line1': BUSINESS.addressLine1,
    'business.address_line2': BUSINESS.addressLine2,
    'business.city': BUSINESS.city,
    'business.state': BUSINESS.state,
    'business.zip': BUSINESS.zipCode,
    'business.country': BUSINESS.country,
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

test('KYB bootstrap #ci', async ({ page, isMobile }) => {
  test.slow(); // ~48.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue(frame);

  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await fillBusinessOwners(frame, {
    businessOwner1Email: BUSINESS.bo2Email,
    businessOwner1LastName: BUSINESS.bo2LastName,
    businessOwner1Name: BUSINESS.bo2Name,
    businessOwner1Phone: BUSINESS.bo2PhoneWithoutCountryCode,
    userFirstName: PERSONAL.firstName,
    userLastName: PERSONAL.lastName,
  });
  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  // Confirm
  await frame.getByTestId('basic-data').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await frame.getByLabel('Business name').first().fill(BUSINESS.name);
  await frame.getByLabel('Doing Business As (optional)').first().fill(BUSINESS.dba);

  await frame.getByTestId('basic-data').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(BUSINESS.name).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.dba).first()).toBeAttached();
  await expect(frame.getByText('•••••••••').first()).toBeAttached();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Edit' }).click();
  await frame.getByLabel('Taxpayer Identification Number (TIN)').first().fill(BUSINESS.tin);
  await frame.getByTestId('identity-section').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Reveal' }).click();
  await expect(frame.getByText(BUSINESS.tin).first()).toBeAttached();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Hide' }).click();
  await expect(frame.getByText('•••••••••').first()).toBeAttached();

  await frame.getByTestId('business-address').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await frame.getByTestId('business-address').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(BUSINESS.addressLine1).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.addressLine2).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.city).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.state).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.zipCode).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.country).first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Confirm your personal data').first()).toBeAttached();
});
