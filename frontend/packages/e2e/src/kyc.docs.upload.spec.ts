import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  clickOnAgree,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  skipTransferOnDesktop,
  uploadImage,
  verifyPhoneNumber,
  waitForVerifyButton,
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

test('E2E.KYC.DriverDocOnly #ci', async ({
  browserName,
  page,
  browser,
  isMobile,
}) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test
  test.setTimeout(120000);
  const context = await browser.newContext();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_0DNRM31nSBCSqHLJQTeWi9';

  await context.grantPermissions(['camera']);
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

  await skipTransferOnDesktop({ frame });
  await page.waitForLoadState();

  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await frame
    .getByText(/Optional/i)
    .first()
    .scrollIntoViewIfNeeded();

  await clickOnAgree({ frame });
  await page.waitForLoadState();

  await uploadImage(
    { frame, page, isMobile },
    /Choose file to upload/i,
    'driver-front.png',
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await uploadImage(
    { frame, page, isMobile },
    /Choose file to upload/i,
    'driver-back.png',
  );
  await clickOnContinue({ frame });

  await context.close();
  return expect(1).toBe(1);
});
