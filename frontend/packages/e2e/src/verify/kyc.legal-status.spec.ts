import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  fillAddress,
  fillNameAndDoB,
  fillEmail,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  verifyPhoneNumber,
  waitForVerifyButton,
  clickOnVerifyWithSms,
  doTransferFromDesktop,
  checkSupport,
  fillVisa,
} from './utils/commands';

const firstName = 'Jane';
const lastName = 'Doe';
const dob = '01/01/1990';
const email = 'janedoe@acme.com';
const phoneNumber = '5555550100';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';
const ssn = '418437970';

test('KYC with US legal status #ci', async ({
  browserName,
  page,
  browser,
  isMobile,
}) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test

  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'pb_test_jaZzYsm4aSPSY4YfH0qe7T';

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/e2e?ob_key=${key}&flow=${flowId}`);
  await page.waitForLoadState();

  await waitForVerifyButton({ page });

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  await page.waitForLoadState();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await selectOutcomeOptional({ frame }, 'Success');

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (!isMobile) {
    await checkSupport({ frame });
  }
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillEmail({ frame }, { email });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillPhoneNumber({ frame }, { phoneNumber });
  await clickOnVerifyWithSms({ frame });
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await fillNameAndDoB({ frame }, { firstName, lastName, dob });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillAddress({ frame, page }, { addressLine1, city, zipCode });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillVisa({ frame, page });
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
      citizenship: 'Afghanistan',
      nationality: 'Afghanistan',
      usLegalStatus: 'Visa',
      visaKind: 'E-1',
      visaExpirationDate: '01/01/2024',
    },
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await doTransferFromDesktop({
    page,
    frame,
    browser,
  });
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
});
