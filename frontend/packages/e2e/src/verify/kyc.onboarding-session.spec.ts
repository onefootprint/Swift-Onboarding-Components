import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYC || 'ob_test_Gw8TsnS2xWOYazI0pugdxu';
const fpSKey = process.env.E2E_SECRET_API_KEY_DEV || '';

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
            'id.email': 'sandbox@onefootprint.com',
            'id.phone_number': '+15555550100',
            'id.first_name': 'Piip',
            'id.last_name': 'Penguin',
            'id.dob': '01/04/1995',
            'id.address_line1': '1 Hayes St',
            'id.city': 'San Francisco',
            'id.state': 'CA',
            'id.country': 'US',
            'id.zip': '94117',
            'id.ssn9': '123-12-1234',
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey],
  );

  console.log(session);
  expect(session).toHaveProperty('token');
  expect(session.token.startsWith('pbtok_')).toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}#${session.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYC with onboarding session token #ci ', async ({ page, isMobile }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Verify your phone number')).toBeAttached();
  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await confirmData(frame, {
    firstName: 'Piip',
    lastName: 'Penguin',
    dob: '01/04/1995',
    email: 'sandbox@onefootprint.com',
    addressLine1: '1 Hayes St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94117',
    country: 'US',
  });

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Add a passkey')).toBeAttached();
});
