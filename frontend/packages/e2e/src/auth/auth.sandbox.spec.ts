import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillEmail,
  clickOnAuthenticateWithFootprint,
  waitForEmailField,
} from '../verify/utils/commands';

const email = 'bruno@onefootprint.com';
const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';

test('Auth with sandbox email #ci', async ({ browserName, page }) => {
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
  await frame.getByLabel('Edit').first().click();
  await frame.getByPlaceholder('Enter test ID').fill('aoy4lrqr9oqKb');
  await frame.getByLabel('Save').first().click();

  await fillEmail({ frame }, { email });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await expect(
    frame.locator('button').filter({ hasText: 'Send code to +49 ••••• •••••' }),
  ).toBeAttached();
});
