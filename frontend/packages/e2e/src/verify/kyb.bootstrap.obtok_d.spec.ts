import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddress,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB_KYCED_BO || 'pb_test_eWuI7QxglTuuVclccyfAk4'; // KYC all BOs
const fpSKey = process.env.E2E_ACME_SECRET_API_KEY_DEV || '';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  // Create a session
  const session = await page.evaluate(
    async ([secretKey, pbKey]) => {
      const response = await fetch('https://api.dev.onefootprint.com/onboarding/session', {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          bootstrap_data: {
            'business.address_line1': '1 Infinite Way',
            'business.city': 'Cupertino',
            'business.corporation_type': 'unknown',
            'business.country': 'US',
            'business.name': 'PrintFoot',
            'business.primary_owner_stake': 73,
            'business.secondary_owners': [{ first_name: 'Bob', last_name: 'Boberto', ownership_stake: 27 }],
            'business.state': 'CA',
            'business.tin': '12-1212121',
            'business.zip': '12121',

            'id.dob': '2000-04-12',
            'id.email': 'id@onefootprint.com',
            'id.first_name': 'Alex',
            'id.last_name': 'Anderson',
            'id.phone_number': '+15555550100',
            'id.ssn9': '121212121',
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey],
  );

  expect(session).toHaveProperty('token');
  expect(session.token.startsWith('obtok_')).toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}#${session.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB obtok_ with kyced bo until the end of the flow #ci', async ({ page, isMobile }) => {
  test.slow(); // ~23.63s
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

  const whoAreBOsH2 = frame.getByText('Who are the beneficial owners?').first();
  await whoAreBOsH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  expect(await frame.locator('input[name="beneficialOwners.0.first_name"]').first().inputValue()).toBe('Alex');
  expect(await frame.locator('input[name="beneficialOwners.0.last_name"]').first().inputValue()).toBe('Anderson');
  expect(await frame.locator('input[name="beneficialOwners.0.ownership_stake"]').first().inputValue()).toBe('73');

  expect(await frame.locator('input[name="beneficialOwners.1.first_name"]').first().inputValue()).toBe('Bob');
  expect(await frame.locator('input[name="beneficialOwners.1.last_name"]').first().inputValue()).toBe('Boberto');
  expect(await frame.locator('input[name="beneficialOwners.1.ownership_stake"]').first().inputValue()).toBe('27');

  expect(await frame.locator('input[name="beneficialOwners.1.email"]').first().inputValue()).toBeFalsy();
  expect(await frame.locator('input[name="beneficialOwners.1.phone_number"]').first().inputValue()).toBeFalsy();

  await frame.locator('input[name="beneficialOwners.1.email"]').first().fill('secondary@onefootprint.com');
  await frame.locator('input[name="beneficialOwners.1.phone_number"]').first().fill('5555550100');

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmBusinessHeader = frame.getByText('Confirm your business data').first();
  await confirmBusinessHeader.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const idAddressLine1 = '432 3rd Ave';
  const idCity = 'Seward';
  const idZipCode = '99664';
  await fillAddress({ frame, page }, { addressLine1: idAddressLine1, city: idCity, zipCode: idZipCode });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmPersonalHeader = frame.getByText('Confirm your personal data').first();
  await confirmPersonalHeader.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
