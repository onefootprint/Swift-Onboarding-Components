import { expect, test } from '@playwright/test';

const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';
const uToken = process.env.E2E_UPDATE_UTOKEN || '';

test.skip('Checks if the legacy config opens the flow #ci', async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'skip on mobile'); // eslint-disable-line playwright/no-skipped-test
  expect(uToken, 'Missing E2E_UPDATE_UTOKEN').toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const attached = { state: 'attached' as const, timeout };

  if (isMobile) test.setTimeout(90000); // eslint-disable-line playwright/no-conditional-in-test

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/auth?ob_key=1&app_url=${authAppUrl}&flow=${flowId}#${uToken}`);
  await page.waitForLoadState();
  await expect(page).toHaveURL(/.*auth/);

  await page
    .getByRole('button')
    .filter({ hasText: 'Update Authentication Methods with Footprint (Legacy)' })
    .first()
    .click();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  const loginDesc = frame.getByText('Log in to modify your account details.');
  await loginDesc.waitFor(attached);
  await expect(loginDesc.first()).toBeAttached();

  await expect(frame.getByText('Welcome back!')).toBeAttached();
  await expect(frame.getByText('Log in to modify your account details.')).toBeAttached();
  await expect(frame.getByText('Send code to +1 (•••) •••‑••00')).toBeAttached();
});
