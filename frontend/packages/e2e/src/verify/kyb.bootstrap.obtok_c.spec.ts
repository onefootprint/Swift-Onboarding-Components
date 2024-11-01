import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from '../utils/commands';
import { BUSINESS, PERSONAL } from '../utils/constants';

const backendUrl = process.env.E2E_BACKEND_URL || 'https://api.dev.onefootprint.com';
const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB || 'pb_test_irxUbxvVOevFXVmhIvHdrf';
const fpSKey = process.env.E2E_SECRET_API_KEY_DEV || '';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  // Create a session
  const session = await page.evaluate(
    async ([secretKey, pbKey, backendUrl, personal, business]) => {
      const id = personal as typeof PERSONAL;
      const biz = business as typeof BUSINESS;
      const response = await fetch(`${backendUrl}/onboarding/session`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          bootstrap_data: {
            'business.address_line1': biz.addressLine1,
            'business.address_line2': biz.addressLine2,
            'business.city': biz.city,
            'business.country': biz.country,
            'business.formation_date': biz.formationDate,
            'business.name': biz.name,
            'business.phone_number': `+${biz.phoneNumber}`,
            'business.state': biz.state,
            'business.tin': biz.tin,
            'business.zip': biz.zipCode,

            'id.address_line1': id.addressLine1,
            'id.address_line2': id.addressLine2,
            'id.city': id.city,
            'id.country': id.country,
            'id.dob': id.dob,
            'id.email': id.email,
            'id.first_name': id.firstName,
            'id.last_name': id.lastName,
            'id.phone_number': `+${id.phone}`,
            'id.ssn9': id.ssn9,
            'id.state': id.state,
            'id.zip': id.zipCode,

            'business.secondary_owners': [
              {
                first_name: 'Secondary',
                last_name: '2nd',
                email: 'secondary@onefootprint.com',
                phone_number: `+${id.phone}`,
                ownership_stake: 10,
              },
              {
                first_name: 'Tertiary',
                last_name: '3rd',
                email: 'tertiary@onefootprint.com',
                phone_number: `+${id.phone}`,
                // ownership_stake: 11, <- intentionally comment out
              },
            ],
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey, backendUrl, PERSONAL, BUSINESS],
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
  await page.waitForLoadState();

  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Edit' }).click();

  expect(await frame.locator('input[name="bos.0.firstName"]').first().inputValue()).toBe(PERSONAL.firstName);
  expect(await frame.locator('input[name="bos.0.lastName"]').first().inputValue()).toBe(PERSONAL.lastName);
  expect(await frame.locator('input[name="bos.0.ownershipStake"]').first().inputValue()).toBeFalsy();

  expect(await frame.locator('input[name="bos.1.firstName"]').first().inputValue()).toBe('Secondary');
  expect(await frame.locator('input[name="bos.1.lastName"]').first().inputValue()).toBe('2nd');
  expect(await frame.locator('input[name="bos.1.email"]').first().inputValue()).toBe('secondary@onefootprint.com');
  expect(await frame.locator('input[name="bos.1.ownershipStake"]').first().inputValue()).toBe('10');

  expect(await frame.locator('input[name="bos.2.firstName"]').first().inputValue()).toBe('Tertiary');
  expect(await frame.locator('input[name="bos.2.lastName"]').first().inputValue()).toBe('3rd');
  expect(await frame.locator('input[name="bos.2.ownershipStake"]').first().inputValue()).toBeFalsy();
  expect(await frame.locator('input[name="bos.2.email"]').first().inputValue()).toBe('tertiary@onefootprint.com');
  expect(await frame.locator('input[name="bos.2.ownershipStake"]').first().inputValue()).toBeFalsy();
});
