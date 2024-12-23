import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddressKYB,
  fillBasicDataKYB,
  fillBusinessOwners,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

import { BUSINESS, PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB || 'pb_test_irxUbxvVOevFXVmhIvHdrf';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': 'e2e@onefootprint.com',
    'id.phone_number': '+15555550100',
    'id.address_line1': PERSONAL.addressLine1,
    'id.address_line2': PERSONAL.addressLine2,
    'id.city': PERSONAL.city,
    'id.country': PERSONAL.country,
    'id.dob': PERSONAL.dob,
    'id.first_name': PERSONAL.firstName,
    'id.last_name': PERSONAL.lastName,
    'id.middle_name': PERSONAL.middleName,
    'id.ssn9': PERSONAL.ssn,
    'id.state': PERSONAL.state,
    'id.zip': PERSONAL.zipCode,
  }),
);

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?ob_key=${key}&bootstrap_data=${userData}&app_url=${appUrl}&f=${flowId}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('Completes KYB flow with two beneficial owners having equal stakes #ci', async ({ page, isMobile }) => {
  test.slow(); // ~48.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success')
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await verifyPhoneNumber({ frame, page }).then(() => page.waitForLoadState());

  await frame
    .getByText("Let's get to know your business!")
    .first()
    .waitFor({ state: 'attached', timeout })
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await fillBasicDataKYB(frame, {
    businessName: BUSINESS.name,
    businessNameOptional: BUSINESS.dba,
    userTIN: BUSINESS.tin,
  })
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await fillAddressKYB(
    { frame, page },
    { addressLine1: PERSONAL.addressLine1, city: PERSONAL.city, zipCode: PERSONAL.zipCode },
  )
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await expect(frame.getByText(BUSINESS.name).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.dba).first()).toBeAttached();

  await expect(frame.getByText('0%').first()).toBeAttached();
  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Edit' }).click();

  await fillBusinessOwners(frame, {
    businessOwner1Email: BUSINESS.bo2Email,
    businessOwner1LastName: BUSINESS.bo2LastName,
    businessOwner1Name: BUSINESS.bo2Name,
    businessOwner1Phone: BUSINESS.bo2PhoneWithoutCountryCode,
    userFirstName: PERSONAL.firstName,
    userLastName: PERSONAL.lastName,
  });
  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(PERSONAL.firstName).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.lastName).first()).toBeAttached();
  await expect(frame.getByText('50%').first()).toBeAttached();

  await expect(frame.getByText(BUSINESS.bo2Name).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2LastName).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2Email).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2Phone).first()).toBeAttached();

  await expect(frame.getByText(PERSONAL.state).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.zipCode).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.country).first()).toBeAttached();

  await frame
    .getByText('Confirm your business data')
    .first()
    .waitFor({ state: 'attached', timeout })
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await frame
    .getByText('Confirm your personal data')
    .first()
    .waitFor({ state: 'attached', timeout })
    .then(() => clickOnContinue(frame))
    .then(() => page.waitForLoadState());

  await expect(page.getByTestId('result').first()).toContainText('_');
});
