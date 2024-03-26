import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  waitForVerifyButton,
  confirmData,
  clickOnAgree,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  fillSSN,
  uploadImage,
  verifyPhoneNumber,
  clickOnVerifyWithSms,
  continueOnDesktop,
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

test('E2E.KYC.DriverDocOnly.Real #real', async ({
  browserName,
  page,
  browser,
  isMobile,
}) => {
  test.setTimeout(120000);
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test
  const context = await browser.newContext({ permissions: ['camera'] });
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_0DNRM31nSBCSqHLJQTeWi9';

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/e2e?ob_key=${key}&flow=${flowId}`);
  await page.waitForLoadState();

  await waitForVerifyButton({ page });

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  await page.waitForLoadState();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  const realOutcomeBtn = frame.getByLabel('Real outcome').first();
  await realOutcomeBtn
    .waitFor({ state: 'attached', timeout: 15000 })
    .then(() => realOutcomeBtn.click())
    .then(() => true)
    .catch(() => false);

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

  await continueOnDesktop({ frame });
  await page.waitForLoadState();

  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await frame
    .getByText(/Optional/i)
    .first()
    .scrollIntoViewIfNeeded();

  await clickOnAgree({ frame });
  await page.waitForLoadState();

  //# region Front side blurred
  await uploadImage(
    { frame, page, isMobile },
    /Choose file to upload/i,
    'driver-front.blurred.png',
  );

  await expect(
    frame.getByText("We couldn't process your image").first(),
  ).toBeAttached();
  //# endregion

  //# region Front side
  await uploadImage(
    { frame, page, isMobile },
    /different file/i,
    'driver-front.png',
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();
  //# endregion

  //# region Back side
  await uploadImage(
    { frame, page, isMobile },
    /Choose file to upload/i,
    'driver-back.png',
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();
  //# endregion

  await context.close();
  return expect(frame.getByTestId('result').innerText).toBeDefined();
});
