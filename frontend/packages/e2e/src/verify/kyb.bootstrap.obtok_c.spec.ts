import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from '../utils/commands';

const backendUrl = process.env.E2E_BACKEND_URL || 'https://api.dev.onefootprint.com';
const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB || 'pb_test_LMYOJWABaBuuXdHdkqYhWp';
const fpSKey = process.env.E2E_ACME_SECRET_API_KEY_DEV || '';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  // Create a session
  const session = await page.evaluate(
    async ([secretKey, pbKey, backendUrl]) => {
      const response = await fetch(`${backendUrl}/onboarding/session`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          bootstrap_data: {
            'business.address_line1': '123 Main St',
            'business.address_line2': 'Ap 201',
            'business.city': 'San Francisco',
            'business.country': 'US',
            'business.formation_date': '1999-12-31',
            'business.name': 'Business name',
            'business.phone_number': '+15555550100',
            'business.state': 'CA',
            'business.tin': '123456789',
            'business.zip': '94105',

            'id.address_line1': '1 Hayes St',
            'id.address_line2': 'Ap 201',
            'id.city': 'San Francisco',
            'id.country': 'US',
            'id.dob': '1995-01-04',
            'id.email': 'sandbox@onefootprint.com',
            'id.first_name': 'Owner',
            'id.last_name': 'Zod',
            'id.phone_number': '+15555550100',
            'id.ssn9': '123-12-1234',
            'id.state': 'CA',
            'id.zip': '94117',

            'business.secondary_owners': [
              {
                first_name: 'Secondary-a',
                last_name: 'Last-name-a',
                email: 'secondary-a@onefootprint.com',
                phone_number: '+15555550100',
                ownership_stake: 10,
              },
              {
                first_name: 'Secondary-b',
                last_name: 'Last-name-b',
                email: 'secondary-b@onefootprint.com',
                phone_number: '+15555550100',
                // ownership_stake: 11, <- intentionally comment out
              },
            ],
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey, backendUrl],
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

test('KYB pbtok_ session with id.xxx, business.xxx and business.secondary_owners #ci', async ({ page, isMobile }) => {
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

  const whoAreBOsH2 = frame.getByText('Add beneficial owners').first();
  await whoAreBOsH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  expect(await frame.locator('input[name="bos.0.firstName"]').first().inputValue()).toBe('Owner');
  expect(await frame.locator('input[name="bos.0.lastName"]').first().inputValue()).toBe('Zod');
  expect(await frame.locator('input[name="bos.0.ownershipStake"]').first().inputValue()).toBeFalsy();

  expect(await frame.locator('input[name="bos.1.firstName"]').first().inputValue()).toBe('Secondary-a');
  expect(await frame.locator('input[name="bos.1.lastName"]').first().inputValue()).toBe('Last-name-a');
  expect(await frame.locator('input[name="bos.1.email"]').first().inputValue()).toBe('secondary-a@onefootprint.com');
  expect(await frame.locator('input[name="bos.1.ownershipStake"]').first().inputValue()).toBe('10');

  expect(await frame.locator('input[name="bos.2.firstName"]').first().inputValue()).toBe('Secondary-b');
  expect(await frame.locator('input[name="bos.2.lastName"]').first().inputValue()).toBe('Last-name-b');
  expect(await frame.locator('input[name="bos.2.ownershipStake"]').first().inputValue()).toBeFalsy();
  expect(await frame.locator('input[name="bos.2.email"]').first().inputValue()).toBe('secondary-b@onefootprint.com');
});
