import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  selectOutcomeOptional,
  verifyPhoneNumber,
  confirmData,
  doLivenessCheck,
} from './utils/commands';

const email = 'piip@onefootprint.com';
const phoneNumber = '+15555550100';
const firstName = 'John';
const lastName = 'Doe';
const dob = '01/01/1990';
const addressLine1 = '123 Main St';
const addressLine2 = 'Apt 1';
const city = 'San Francisco';
const state = 'CA';
const zipCode = '94105';
const country = 'US';
const ssn9 = '123412345';

test('E2E.SDK footprint-js 3.7.1 #ci #debug', async ({
  browserName,
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  const publicKey = 'pb_test_kZerd69hBocbsmHqAuYBE1';
  const bootstrapData = {
    'id.email': email,
    'id.phone_number': phoneNumber,
    'id.first_name': firstName,
    'id.last_name': lastName,
    'id.dob': dob,
    'id.address_line1': addressLine1,
    'id.address_line2': addressLine2,
    'id.city': city,
    'id.state': state,
    'id.zip': zipCode,
    'id.country': country,
    'id.ssn9': ssn9,
  };

  await page.goto(
    `https://footprint-js-3-7-1.preview.onefootprint.com/?ob_key=${publicKey}&user_data=${encodeURIComponent(
      JSON.stringify(bootstrapData),
    )}&flow=${flowId}`,
  );

  await page.waitForLoadState();

  const btn = page.getByText('Launch Footprint').first();
  await btn.waitFor({ state: 'attached', timeout: 20000 }).then(() => true);
  await btn.click();

  await page.waitForLoadState();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional({ frame }, 'Success');
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });

  await page.waitForLoadState();

  await confirmData(
    { frame },
    {
      firstName,
      lastName,
      dob,
      addressLine1,
      addressLine2,
      city,
      state: 'AL',
      country,
      zipCode,
      ssn: ssn9,
    },
  );

  await context.close();
  return expect(1).toBe(1);
});
