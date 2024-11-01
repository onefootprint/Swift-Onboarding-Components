import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  fillEmail,
  fillPhoneNumber,
  selectOutcomeOptional,
} from '../utils/commands';

const appUrl = process.env.E2E_HOSTED_BASE_URL || 'http://localhost:3004';
const key = process.env.E2E_OB_KYC || 'pb_test_MrO9iLr9QyJ25GwIeJDdCV';

const email = 'sandbox@onefootprint.com' as const;
const phoneNumber = '5555550100';

test('ID verify phone #ci', async ({ page, isMobile, browserName }) => {
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

  await expect(page.getByText('Verify your phone number')).toBeAttached();
});
