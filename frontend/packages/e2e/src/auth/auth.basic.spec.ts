import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillEmail,
  fillPhoneNumber,
  verifyPhoneNumber,
  clickOnVerifyWithSms,
  clickOnAuthenticateWithFootprint,
  waitForEmailField,
} from '../verify/utils/commands';

const email = 'sandbox@onefootprint.com';
const phoneNumber = '5555550100';
const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';

test('Auth with email, fill phone number, verify phone #ci', async ({
  browserName,
  page,
}) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_2TwubGlrWdKaJnWsQQKQYl';

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/auth?ob_key=${key}&app_url=${authAppUrl}&flow=${flowId}`,
  );
  await page.waitForLoadState();

  await clickOnAuthenticateWithFootprint({ frame: page });

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await waitForEmailField({ frame });

  await fillEmail({ frame }, { email });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillPhoneNumber({ frame }, { phoneNumber });
  await clickOnVerifyWithSms({ frame });
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  expect(1).toBe(1);
});
