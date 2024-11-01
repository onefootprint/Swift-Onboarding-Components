import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddressKYB,
  fillBasicDataKYB,
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
    async args => {
      const [secretKey, pbKey, backendUrl, personal] = args;
      const id = personal as typeof PERSONAL;
      const response = await fetch(`${backendUrl}/onboarding/session`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          bootstrap_data: {
            'document.custom.trust_document': '1',
            'id.address_line1': id.addressLine1,
            'id.address_line2': id.addressLine2,
            'id.city': id.city,
            'id.country': id.country,
            'id.dob': id.dob,
            'id.email': id.email,
            'id.first_name': id.firstName,
            'id.last_name': id.lastName,
            'id.phone_number': `+${id.phone}`,
            'id.ssn9': id.ssn,
            'id.state': id.state,
            'id.zip': id.zipCode,
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey, backendUrl, PERSONAL],
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

  await fillBasicDataKYB(frame, {
    businessName: BUSINESS.name,
    businessNameOptional: BUSINESS.as,
    userTIN: BUSINESS.tin,
  });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddressKYB(
    { frame, page },
    { addressLine1: BUSINESS.addressLine1, city: BUSINESS.city, zipCode: BUSINESS.zipCode },
  );
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText(PERSONAL.firstName).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.lastName).first()).toBeAttached();
});
