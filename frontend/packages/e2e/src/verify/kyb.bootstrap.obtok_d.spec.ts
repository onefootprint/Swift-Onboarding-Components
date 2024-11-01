import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddress,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';
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
            'business.corporation_type': 'unknown',
            'business.country': biz.country,
            'business.name': biz.name,
            'business.state': biz.state,
            'business.tin': biz.tin,
            'business.zip': biz.zipCode,
            'business.primary_owner_stake': 73,
            'business.secondary_owners': [{ first_name: biz.bo2Name, last_name: biz.bo2LastName, ownership_stake: 27 }],

            'id.dob': id.dob,
            'id.email': id.email,
            'id.first_name': id.firstName,
            'id.last_name': id.lastName,
            'id.phone_number': `+${id.phone}`,
            'id.ssn9': id.ssn9,
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

test('KYB pbtok_ with kyced bo until the end of the flow #ci', async ({ page, isMobile }) => {
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
  expect(await frame.locator('input[name="bos.0.ownershipStake"]').first().inputValue()).toBe('73');

  expect(await frame.locator('input[name="bos.1.firstName"]').first().inputValue()).toBe(BUSINESS.bo2Name);
  expect(await frame.locator('input[name="bos.1.lastName"]').first().inputValue()).toBe(BUSINESS.bo2LastName);
  expect(await frame.locator('input[name="bos.1.ownershipStake"]').first().inputValue()).toBe('27');

  expect(await frame.locator('input[name="bos.1.email"]').first().inputValue()).toBeFalsy();
  expect(await frame.locator('input[name="bos.1.phoneNumber"]').first().inputValue()).toBeFalsy();

  await frame.locator('input[name="bos.1.email"]').first().fill('secondary@onefootprint.com');
  await frame.locator('input[name="bos.1.phoneNumber"]').first().fill('5555550100');

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmBusinessHeader = frame.getByText('Confirm your business data').first();
  await confirmBusinessHeader.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddress(
    { frame, page },
    { addressLine1: PERSONAL.addressLine1, city: PERSONAL.city, zipCode: PERSONAL.zipCode },
  );
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmPersonalHeader = frame.getByText('Confirm your personal data').first();
  await confirmPersonalHeader.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
