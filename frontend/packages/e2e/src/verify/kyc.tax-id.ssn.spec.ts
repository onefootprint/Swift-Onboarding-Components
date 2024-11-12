import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillTaxId,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_ITIN || 'pb_test_bi2EIXG5ZucOejispk2xUE';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.address_line1': PERSONAL.addressLine1,
    'id.address_line2': PERSONAL.addressLine2,
    'id.city': PERSONAL.city,
    'id.country': PERSONAL.country,
    'id.dob': PERSONAL.dob,
    'id.email': PERSONAL.email,
    'id.first_name': PERSONAL.firstName,
    'id.last_name': PERSONAL.lastName,
    'id.middle_name': PERSONAL.middleName,
    'id.phone_number': `+${PERSONAL.phone}`,
    'id.state': PERSONAL.state,
    'id.zip': PERSONAL.zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&user_data=${userData}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYC Tax ID/SSN #ci', async ({ page, isMobile }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success')
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await expect(frame.getByText('Tax ID').first()).toBeAttached();
  await fillTaxId(frame, { id: '418437970' });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Confirm your personal data').first()).toBeAttached();
  await frame.getByRole('button').filter({ hasText: 'Reveal' }).first().click();
  await expect(frame.getByText('418-43-7970').first()).toBeAttached();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_', { timeout: 5000 });
});
