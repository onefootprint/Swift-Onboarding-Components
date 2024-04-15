import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  selectOutcomeOptional,
  verifyPhoneNumber,
  confirmData,
  waitForVerifyButton,
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

test('E2E.Bootstrap #ci', async ({ browserName, page, isMobile }) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test

  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
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
    `/e2e?flow=${flowId}&user_data=${encodeURIComponent(
      JSON.stringify(bootstrapData),
    )}`,
  );
  await page.waitForLoadState();

  await waitForVerifyButton({ page });

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  await page.waitForLoadState();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional({ frame }, 'Success');
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  // Check that "Log in with a different account" is visible
  await expect(
    frame.getByText('Log in with a different account'),
  ).toBeAttached();
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

  await clickOnContinue({ frame });
  await page.waitForLoadState();

  return expect(1).toBe(1);
});
