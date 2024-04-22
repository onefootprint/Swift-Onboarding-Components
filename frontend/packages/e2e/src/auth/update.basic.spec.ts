import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnUpdateAuthentication,
  fillEmail,
  verifyEmail,
  waitForEmailField,
} from '../verify/utils/commands';

const email = 'sandbox@onefootprint.com';
const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';
const uToken = process.env.E2E_UPDATE_UTOKEN || '';

test('Update auth methods by providing email #ci', async ({
  browserName,
  page,
}) => {
  expect(uToken, 'Missing E2E_UPDATE_UTOKEN').toBeTruthy();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/auth?ob_key=1&app_url=${authAppUrl}&flow=${flowId}#${uToken}`,
  );
  await page.waitForLoadState();

  await clickOnUpdateAuthentication({ frame: page });

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  const loginDescText = frame
    .getByText('Log in to modify your account details.')
    .first();
  await loginDescText
    .waitFor({ state: 'attached', timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  await expect(loginDescText.first()).toBeAttached();

  await frame
    .locator('button')
    .filter({ hasText: 'Send code to s••••••@o' })
    .first()
    .click();
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await verifyEmail({ frame, page });
  await page.waitForLoadState();

  const emailEntryTExt = frame.getByText(email).first();
  await emailEntryTExt
    .waitFor({ state: 'attached', timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  await expect(emailEntryTExt.first()).toBeAttached();

  await frame.getByRole('button', { name: email }).first().click();
  await page.waitForLoadState();

  await waitForEmailField({ frame });
  await fillEmail({ frame }, { email });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await verifyEmail({ frame, page });
  await page.waitForLoadState();

  const finishButton = frame.getByRole('button', { name: 'Finish' }).first();
  await finishButton
    .waitFor({ state: 'attached', timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  await expect(finishButton.first()).toBeAttached();
});
