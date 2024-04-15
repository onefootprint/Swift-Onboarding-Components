import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillSSN,
  selectOutcomeOptional,
  verifyEmail,
  waitForVerifyButton,
} from './utils/commands';

const firstName = 'Jane';
const lastName = 'Doe';
const dob = '01/01/1990';
const email: 'sandbox@onefootprint.com' = 'sandbox@onefootprint.com';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';
const ssn = '418437970';

test('KYC E2E.NoPhoneFlow #ci', async ({ browserName, page, isMobile }) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test

  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_h9Qp2W3Trk1pfIoI7dTD5q';

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/e2e?ob_key=${key}&flow=${flowId}`);
  await page.waitForLoadState();

  await waitForVerifyButton({ page });

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  await page.waitForLoadState();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional({ frame }, 'Success');
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillEmail({ frame }, { email });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await verifyEmail({ frame, page });
  await page.waitForLoadState();

  await fillNameAndDoB({ frame }, { firstName, lastName, dob });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillAddress({ frame, page }, { addressLine1, city, zipCode });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillSSN({ frame }, { ssn });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await confirmData(
    { frame },
    {
      firstName,
      lastName,
      dob,
      addressLine1,
      city,
      state: 'AL',
      zipCode,
      country: 'US',
      ssn,
    },
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  return expect(frame.getByTestId('result').innerText).toBeDefined();
});
