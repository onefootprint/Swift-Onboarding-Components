import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  fillEmail,
  fillPhoneNumber,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB || 'pb_test_LMYOJWABaBuuXdHdkqYhWp';

const businessName = 'Business name';
const businessTin = '12-3456789';
const businessAddressLine1 = '1 Hayes St';
const businessCity = 'San Francisco';
const businessState = 'CA';
const businessZip = '94117';
const businessCountry = 'US';

const idFirstName = 'Andrew';
const idLastName = 'Anderson';

const businessSecondaryOwnersFirstName = 'Bob';
const businessSecondaryOwnersLastName = 'Bobson';

const userData = encodeURIComponent(
  JSON.stringify({
    'business.name': businessName,
    'business.tin': businessTin,
    'business.address_line1': businessAddressLine1,
    'business.city': businessCity,
    'business.state': businessState,
    'business.zip': businessZip,
    'business.country': businessCountry,

    // 'id.email': 'sandbox@onefootprint.com',
    // 'id.phone_number': '+15555550100',
    // 'id.first_name': idFirstName,
    // 'id.last_name': idLastName,

    'business.primary_owner_stake': 51,

    'business.secondary_owners': [
      {
        first_name: businessSecondaryOwnersFirstName,
        last_name: businessSecondaryOwnersLastName,
        email: 'piip@onefootprint.com',
        phone_number: '+15555550100',
        ownership_stake: 49,
      },
    ],
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

test('KYB bootstrapping only business.primary_owner_stake and business.secondary_owners #ci', async ({
  page,
  isMobile,
}) => {
  test.slow(); // ~17s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillEmail(frame, 'sandbox@onefootprint.com');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillPhoneNumber(frame, '5555550100');
  await clickOnVerifyWithSms(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const whoAreBOsH2 = frame.getByText('Add beneficial owners').first();
  await whoAreBOsH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  await frame.locator('input[name="bos.0.firstName"]').first().fill(idFirstName);
  await frame.locator('input[name="bos.0.lastName"]').first().fill(idLastName);

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  await expect(frame.getByText(businessName).first()).toBeAttached();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Reveal' }).click();
  await expect(frame.getByText(businessTin).first()).toBeAttached();

  await expect(frame.getByText(businessAddressLine1).first()).toBeAttached();
  await expect(frame.getByText(businessCity).first()).toBeAttached();
  await expect(frame.getByText(businessState).first()).toBeAttached();
  await expect(frame.getByText(businessZip).first()).toBeAttached();
  await expect(frame.getByText(businessCountry).first()).toBeAttached();
  await expect(frame.getByText('51%').first()).toBeAttached();

  await expect(frame.getByText(idFirstName).first()).toBeAttached();
  await expect(frame.getByText(idLastName).first()).toBeAttached();
  await expect(frame.getByText(businessSecondaryOwnersFirstName).first()).toBeAttached();
  await expect(frame.getByText(businessSecondaryOwnersLastName).first()).toBeAttached();
  await expect(frame.getByText('piip@onefootprint.com').first()).toBeAttached();
  await expect(frame.getByText('+15555550100').first()).toBeAttached();
  await expect(frame.getByText('49%').first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText(idFirstName).first()).toBeAttached();
  await expect(frame.getByText(idLastName).first()).toBeAttached();
});
