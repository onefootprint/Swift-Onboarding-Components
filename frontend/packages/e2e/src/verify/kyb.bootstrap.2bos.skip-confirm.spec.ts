import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from '../utils/commands';

import { BUSINESS, PERSONAL } from '../utils/constants';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYB_SKIP_CONFIRM || 'pb_test_xi5a53CLZBRfUJrAtnrJNu';

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

    'business.primary_owner_stake': 100,

    'business.name': BUSINESS.name,
    'business.dba': BUSINESS.dba,
    'business.tin': BUSINESS.tin,
    'business.phone_number': `+1${BUSINESS.bo2Phone}`,
    'business.address_line1': PERSONAL.addressLine1,
    'business.address_line2': PERSONAL.addressLine2,
    'business.city': PERSONAL.city,
    'business.country': PERSONAL.country,
    'business.state': PERSONAL.state,
    'business.zip': PERSONAL.zipCode,
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

test('Completes KYB flow with two beneficial owners having equal stakes skip confirm #ci', async ({
  page,
  isMobile,
}) => {
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

  await expect(page.getByTestId('result').first()).toContainText('_');
});
