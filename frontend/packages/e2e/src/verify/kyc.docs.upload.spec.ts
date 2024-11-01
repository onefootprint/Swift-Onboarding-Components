import { expect, test } from '@playwright/test';

import {
  clickOnAgree,
  clickOnContinue,
  confirmData,
  continueOnDesktop,
  selectOutcomeOptional,
  uploadImage,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

import { PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_DOC || 'pb_test_Bmb3bDufq7THKCHsCExcJg';

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

test('E2E.KYC.DriverDocOnly #ci', async ({ page, browser, isMobile }) => {
  test.slow(); // ~30.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const context = await browser.newContext({ permissions: ['camera'] });

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

  await continueOnDesktop(frame);
  await page.waitForLoadState();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame
    .getByText(/Optional/i)
    .first()
    .scrollIntoViewIfNeeded();

  await clickOnAgree(frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-front.png');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await uploadImage({ frame, page, isMobile }, /Choose file to upload/i, 'driver-back.png');
  await clickOnContinue(frame);

  await context.close();
  return expect(1).toBe(1);
});
