import { expect, test } from '@playwright/test';

import { verifyPhoneNumber } from '../verify/utils/commands';

const iframeSelector = 'iframe[name^="footprint-iframe-"]';
const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';
const key = process.env.E2E_AUTH_KEY || 'ob_test_2TwubGlrWdKaJnWsQQKQYl';

const email = 'sandbox@onefootprint.com';
const phoneNumber = '5555550100';

test('Auth with email, fill phone number, verify phone #ci', async ({
  browserName,
  isMobile,
  page,
}) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  if (isMobile) test.setTimeout(90000); // eslint-disable-line playwright/no-conditional-in-test

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/auth?ob_key=${key}&app_url=${authAppUrl}&flow=${flowId}`,
  );
  await page.waitForLoadState();
  await expect(page).toHaveURL(/.*auth/);

  await page
    .getByRole('button')
    .filter({ hasText: /Authenticate with Footprint/i })
    .first()
    .click();

  const $email = page.frameLocator(iframeSelector).getByLabel(/email/i);
  await $email.waitFor({ state: 'attached', timeout });
  await $email.first().fill(email);

  await page
    .frameLocator(iframeSelector)
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .first()
    .click();

  await page.waitForLoadState();

  const $phone = page
    .frameLocator(iframeSelector)
    .locator('input[name="phoneNumber"]');
  await $phone.waitFor({ state: 'attached', timeout });
  await $phone.fill(phoneNumber);

  await page
    .frameLocator(iframeSelector)
    .getByRole('button')
    .filter({ hasText: /verify with sms/i })
    .first()
    .click();
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame: page.frameLocator(iframeSelector), page });
  await page.waitForLoadState();

  expect(1).toBe(1);
});
