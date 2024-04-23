import { expect, test } from '@playwright/test';

const iframeSelector = 'iframe[name^="footprint-iframe-"]';
const authAppUrl = process.env.E2E_AUTH_BASE_URL || 'http://localhost:3011';
const key = process.env.E2E_AUTH_KEY || 'ob_test_2TwubGlrWdKaJnWsQQKQYl';

const email = 'bruno@onefootprint.com';

test('Auth with sandbox email #ci', async ({ browserName, isMobile, page }) => {
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

  const $sandBoxEdit = page.frameLocator(iframeSelector).getByLabel('Edit');
  await expect($sandBoxEdit).toBeAttached();
  await $sandBoxEdit.first().click();

  await page
    .frameLocator(iframeSelector)
    .getByPlaceholder('Enter test ID')
    .fill('aoy4lrqr9oqKb');
  await page.frameLocator(iframeSelector).getByLabel('Save').first().click();

  const $email = page.frameLocator(iframeSelector).getByLabel(/email/i);
  await $email.waitFor({ state: 'attached', timeout });
  await expect($email).toBeAttached();
  await $email.first().fill(email);

  await page
    .frameLocator(iframeSelector)
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .first()
    .click();
  await page.waitForLoadState();

  await expect(
    page
      .frameLocator(iframeSelector)
      .locator('button')
      .filter({ hasText: 'Send code to +49 ••••• •••••' }),
  ).toBeAttached();
});
