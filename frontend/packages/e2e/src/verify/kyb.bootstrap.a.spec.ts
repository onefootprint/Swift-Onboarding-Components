import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from '../utils/commands';
import { BUSINESS, PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB || 'pb_test_irxUbxvVOevFXVmhIvHdrf';

const userData = encodeURIComponent(
  JSON.stringify({
    'business.name': BUSINESS.name,
    'business.tin': BUSINESS.tin,
    'business.address_line1': BUSINESS.addressLine1,
    'business.city': BUSINESS.city,
    'business.state': BUSINESS.state,
    'business.zip': BUSINESS.zipCode,
    'business.country': PERSONAL.country,

    'id.email': 'sandbox@onefootprint.com',
    'id.phone_number': '+15555550100',
    'id.first_name': PERSONAL.firstName,
    'id.last_name': PERSONAL.lastName,

    'business.primary_owner_stake': 51,
    'business.secondary_owners': [
      {
        first_name: BUSINESS.bo2Name,
        last_name: BUSINESS.bo2LastName,
        email: 'e2e@onefootprint.com',
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

test('KYB bootstrapping id.xxx, business.primary_owner_stake and business.secondary_owners #ci', async ({
  page,
  isMobile,
}) => {
  test.slow(); // ~17s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  // For now, we will show the BOs screen even when they are bootstrapped.
  // Once we support editing on the confirm screen, we should just jump straight to the confirm screen.
  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  await expect(frame.getByText(BUSINESS.name).first()).toBeAttached();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Edit' }).click();
  await frame.getByLabel('Taxpayer Identification Number (TIN)').first().fill(BUSINESS.tin);
  await frame.getByTestId('identity-section').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Reveal' }).click();
  await expect(frame.getByText(BUSINESS.tin).first()).toBeAttached();

  await expect(frame.getByText(BUSINESS.addressLine1).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.city).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.state).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.zipCode).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.country).first()).toBeAttached();
  await expect(frame.getByText('51%').first()).toBeAttached();

  await expect(frame.getByText(PERSONAL.firstName).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.lastName).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2Name).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2LastName).first()).toBeAttached();
  await expect(frame.getByText('e2e@onefootprint.com').first()).toBeAttached();
  await expect(frame.getByText('+15555550100').first()).toBeAttached();
  await expect(frame.getByText('49%').first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  expect(await frame.getByLabel('First name').first().inputValue()).toBe(PERSONAL.firstName);
  expect(await frame.getByLabel('Last name').first().inputValue()).toBe(PERSONAL.lastName);
});
