import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillBeneficialOwners,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

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

const beneficialOwner1Name = 'Bob';
const beneficialOwner1LastName = 'Lee';
const beneficialOwner1Email = 'boblee@acme.com';
const beneficialOwner1Phone = '6105579459';

const businessName = 'Acme Bank Inc.';
const businessDba = 'Banana Bank';
const businessTin = '12-3456789';
const businessCorporationType = 'unknown';
const businessWebsite = 'http://www.google.com';

const businessAddressLine1 = '123 Main St';
const businessAddressLine2 = 'Apt 123';
const businessCity = 'Boston';
const businessState = 'MA';
const businessZip = '02117';
const businessUs = 'US';

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
    'business.name': businessName,
    'business.dba': businessDba,
    'business.tin': businessTin,
    'business.corporation_type': businessCorporationType,
    'business.website': businessWebsite,
    'business.phone_number': '+12025550179',
    'business.address_line1': businessAddressLine1,
    'business.address_line2': businessAddressLine2,
    'business.city': businessCity,
    'business.state': businessState,
    'business.zip': businessZip,
    'business.country': businessUs,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
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

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
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

  // Confirm
  await frame.getByTestId('basic-data').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await frame.getByTestId('basic-data').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(businessName).first()).toBeAttached();
  await expect(frame.getByText(businessDba).first()).toBeAttached();
  await expect(frame.getByText('•••••••••').first()).toBeAttached();
  await expect(frame.getByText(businessCorporationType).first()).toBeAttached();
  await expect(frame.getByText(businessWebsite).first()).toBeAttached();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Reveal' }).click();
  await expect(frame.getByText(businessTin).first()).toBeAttached();
  await frame.getByTestId('identity-section').getByRole('button', { name: 'Hide' }).click();

  await frame.getByTestId('business-address').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await frame.getByTestId('business-address').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(businessAddressLine1).first()).toBeAttached();
  await expect(frame.getByText(businessAddressLine2).first()).toBeAttached();
  await expect(frame.getByText(businessCity).first()).toBeAttached();
  await expect(frame.getByText(businessState).first()).toBeAttached();
  await expect(frame.getByText(businessZip).first()).toBeAttached();
  await expect(frame.getByText(businessUs).first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Confirm your personal data').first()).toBeAttached();
});
