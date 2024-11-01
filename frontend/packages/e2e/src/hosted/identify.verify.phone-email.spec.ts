import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  fillEmail,
  fillPhoneNumber,
  selectOutcomeOptional,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_HOSTED_BASE_URL || 'http://localhost:3004';
const key = process.env.E2E_OB_ID_PHONE_EMAIL || 'pb_test_QMY8oyvlJ7lKlkqW9iJCof';

const email = 'sandbox@onefootprint.com' as const;
const phoneNumber = '5555550100';

test('ID verify phone email #ci', async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`${appUrl}?type=ob_pk&f=${flowId}#${key}`);
  await page.waitForLoadState();

  const btnVerify = page.getByRole('button', { name: 'Verify your identity' });
  await btnVerify.waitFor({ state: 'attached', timeout });
  await btnVerify.first().click();
  await page.waitForLoadState();

  await selectOutcomeOptional(page, 'Success');
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillEmail(page, email);
  await clickOnContinue(page);
  await page.waitForLoadState();

  await fillPhoneNumber(page, phoneNumber);
  await clickOnVerifyWithSms(page);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame: page, page });
  await page.waitForLoadState();

  await expect(page.getByText('Verify your email address')).toBeAttached();
});
