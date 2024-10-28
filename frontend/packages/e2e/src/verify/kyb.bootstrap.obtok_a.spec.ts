import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddressKYB,
  fillBasicDataKYB,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const backendUrl = process.env.E2E_BACKEND_URL || 'https://api.dev.onefootprint.com';
const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB || 'pb_test_LMYOJWABaBuuXdHdkqYhWp';
const fpSKey = process.env.E2E_ACME_SECRET_API_KEY_DEV || '';

const businessName = 'Business name';
const businessNameOptional = 'Optional name';
const businessTin = '123456789';

const businessAddressLine1 = '123 Main St';
const businessCity = 'San Francisco';
const businessZipCode = '94105';

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
            'document.custom.trust_document': '1',
            'id.address_line1': '1 Hayes St',
            'id.address_line2': 'Ap 201',
            'id.city': 'San Francisco',
            'id.country': 'US',
            'id.dob': '01/04/1995',
            'id.email': 'sandbox@onefootprint.com',
            'id.first_name': 'Piip',
            'id.last_name': 'Penguin',
            'id.phone_number': '+15555550100',
            'id.ssn9': '123-12-1234',
            'id.state': 'CA',
            'id.zip': '94117',
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

test('KYB pbtok_ session with id.xxx #ci', async ({ page, isMobile }) => {
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

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillBasicDataKYB(frame, {
    businessName,
    businessNameOptional,
    userTIN: businessTin,
  });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddressKYB(
    { frame, page },
    { addressLine1: businessAddressLine1, city: businessCity, zipCode: businessZipCode },
  );
  await clickOnContinue(frame);
  await page.waitForLoadState();

  expect(await frame.getByLabel('First name').first().inputValue()).toBe('Piip');
  expect(await frame.getByLabel('Last name').first().inputValue()).toBe('Penguin');
});
