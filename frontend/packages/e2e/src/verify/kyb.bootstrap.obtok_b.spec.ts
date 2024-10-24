import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnYes,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB || 'pb_test_LMYOJWABaBuuXdHdkqYhWp';
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
            'business.name': 'Business name',
            'business.phone_number': '+15555550100',
            'business.tin': '123456789',
            'business.address_line1': '123 Main St',
            'business.address_line2': 'Ap 201',
            'business.city': 'San Francisco',
            'business.state': 'CA',
            'business.zip': '94105',
            'business.country': 'US',
            'business.formation_date': '1999-12-31',
            'document.custom.trust_document': '1',

            'id.first_name': 'Owner',
            'id.last_name': 'Zod',
            'id.email': 'sandbox@onefootprint.com',
            'id.phone_number': '+15555550100',
            'id.ssn9': '123-12-1234',
            'id.dob': '01/04/1995',
            'id.address_line1': '1 Hayes St',
            'id.address_line2': 'Ap 201',
            'id.city': 'San Francisco',
            'id.state': 'CA',
            'id.zip': '94117',
            'id.country': 'US',
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey],
  );

  expect(session).toHaveProperty('token');
  expect(session.token.startsWith('pbtok_')).toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}&ob_key=${session.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB pbtok_ session with id.xxx and business.xxx #ci', async ({ page, isMobile }) => {
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
  await whoAreBOsH2.waitFor({ state: 'attached', timeout }).catch(() => false);

  expect(await frame.locator('input[name="beneficialOwners.0.first_name"]').first().inputValue()).toBe('Owner');
  expect(await frame.locator('input[name="beneficialOwners.0.last_name"]').first().inputValue()).toBe('Zod');

  const primaryOwnerStake = frame.locator('input[name="beneficialOwners.0.ownership_stake"]').first();
  expect(await primaryOwnerStake.inputValue()).toBeFalsy();
  await primaryOwnerStake.clear();
  await primaryOwnerStake.fill('51');

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const modalSumStakeLessThan100 = frame.getByLabel("Why doesn't it add up to 100%?").first();
  await modalSumStakeLessThan100
    .waitFor({ state: 'attached', timeout })
    .then(() => modalSumStakeLessThan100.fill('e2e test'));

  await clickOnYes(frame);
  await page.waitForLoadState();

  await modalSumStakeLessThan100.waitFor({ state: 'detached', timeout });

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout }).catch(() => false);

  await expect(frame.getByText('Business name').first()).toBeAttached();

  await frame.getByTestId('identity-section').getByRole('button', { name: 'Reveal' }).click();
  await expect(frame.getByText('12-3456789').first()).toBeAttached();

  await expect(frame.getByText('123 Main St, Ap 201').first()).toBeAttached();
  await expect(frame.getByText('San Francisco, CA, 94105, US').first()).toBeAttached();
  await expect(frame.getByText('51%').first()).toBeAttached();
});
