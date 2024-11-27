import { expect, test } from '@playwright/test';
import { sixDigitChallenger } from '../utils/commands';

const iframeSelector = 'iframe[name^="footprint-iframe-"]';
const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';
const key = process.env.E2E_AUTH_KEY || 'pb_test_x4C4ofRAKiGuTuiD5CIuPI';

const email = 'sandbox@onefootprint.com';

test.skip('Auth with sandbox email #ci', async ({ browserName, isMobile, page }) => {
  test.slow();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/auth?ob_key=${key}&app_url=${authAppUrl}&flow=${flowId}`);
  await page.waitForLoadState();
  await expect(page).toHaveURL(/.*auth/);

  await page
    .getByRole('button')
    .filter({ hasText: /Authenticate with Footprint/i })
    .first()
    .click();

  const frame = page.frameLocator(iframeSelector);
  const sandBoxEdit = frame.getByLabel('Edit');
  await expect(sandBoxEdit).toBeAttached();
  await sandBoxEdit.first().click();

  await frame.getByPlaceholder('Enter test ID').fill('4nIf1LTzo8h7q');
  await frame.getByLabel('Save').first().click();

  const emailEl = frame.getByLabel(/email/i);
  await emailEl.waitFor({ state: 'attached', timeout });
  await expect(emailEl).toBeAttached();
  await emailEl.first().fill(email);

  await frame
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .first()
    .click();
  await page.waitForLoadState();

  await expect(frame.getByText('Welcome back!').first()).toBeAttached();
  await sixDigitChallenger('Enter the 6-digit code sent to +1 (•••) •••‑••00.', { frame, page });
  await page.waitForLoadState();

  await expect(frame.getByText('Welcome back!').first()).not.toBeAttached();
});
