import { expect, test } from '@playwright/test';

import { verifyEmail } from '../utils/commands';

const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';
const uToken = process.env.E2E_UPDATE_UTOKEN || '';

const email = 'sandbox@onefootprint.com';

test('Update auth methods by providing email #ci', async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(!isMobile, 'It will only run in mobile'); // eslint-disable-line playwright/no-skipped-test
  expect(uToken, 'Missing E2E_UPDATE_UTOKEN').toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const attached = { state: 'attached' as const, timeout };

  if (isMobile) test.setTimeout(90000); // eslint-disable-line playwright/no-conditional-in-test

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/auth?ob_key=1&app_url=${authAppUrl}&flow=${flowId}#${uToken}`);
  await page.waitForLoadState();
  await expect(page).toHaveURL(/.*auth/);

  await page.getByRole('button').filter({ hasText: 'Update Authentication Methods with Footprint' }).first().click();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  const loginDesc = frame.getByText('Log in to modify your account details.');
  await loginDesc.waitFor(attached);
  await expect(loginDesc.first()).toBeAttached();

  await frame.locator('button').filter({ hasText: 'Send code to s••••••@o' }).first().click();
  await frame
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .first()
    .click();
  await page.waitForLoadState();

  await verifyEmail({ frame, page });
  await page.waitForLoadState();

  const emailEntryText = frame.getByText(email);
  await emailEntryText.waitFor(attached);
  await expect(emailEntryText.first()).toBeAttached();

  await frame.getByRole('button', { name: email }).first().click();
  await page.waitForLoadState();

  const emailEl = frame.getByLabel(/email/i);
  await emailEl.waitFor(attached);
  await emailEl.first().fill(email);

  await frame
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .first()
    .click();
  await page.waitForLoadState();

  await verifyEmail({ frame, page });
  await page.waitForLoadState();

  const finish = frame.getByRole('button', { name: 'Finish' });
  await finish.waitFor(attached);
  await expect(finish.first()).toBeAttached();
});
