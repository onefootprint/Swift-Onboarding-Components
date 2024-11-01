import { expect, test } from '@playwright/test';

import {
  clickOn,
  clickOnContinue,
  confirmData,
  selectOutcomeOptional,
  uploadImage,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';
import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_CUSTOM_DOC || 'pb_test_GTqQz8i263hV9lBv3nKQxj';

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
    'id.ssn9': PERSONAL.ssn,
    'id.state': PERSONAL.state,
    'id.zip': PERSONAL.zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&app_url=${appUrl}&f=${flowId}&bootstrap_data=${userData}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('E2E.KYC.CustomDoc.PreferUpload #ci', async ({ page, isMobile }) => {
  test.slow(); // ~30.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = 5000;

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await confirmData(frame, {
    addressLine1: PERSONAL.addressLine1,
    city: PERSONAL.city,
    country: PERSONAL.country,
    dob: PERSONAL.dob,
    firstName: PERSONAL.firstName,
    lastName: PERSONAL.lastName,
    ssn: PERSONAL.ssn,
    state: PERSONAL.state,
    zipCode: PERSONAL.zipCode,
  });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  /** First, go to mobile option */
  await clickOn(/continue on mobile instead/i, frame);
  await page.waitForLoadState();

  /** Then, go to desktop option */
  await clickOn(/continue on desktop/i, frame);
  await page.waitForLoadState();

  /** Finally, upload the image */
  await uploadImage({ frame, page, isMobile }, /upload file/i, 'driver-front.png');
  await page.waitForLoadState();

  await expect(frame.getByText('Success!').first()).toBeAttached({ timeout: 10000 });

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
