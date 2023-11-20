import { expect, test } from '@playwright/test';

import {
  confirmData,
  fillSSN,
  clickOnContinue,
  fillAddress,
  fillAddressKYB,
  fillBasicDataKYB,
  fillBeneficialOwners,
  fillEmail,
  fillPhoneNumber,
  selectOutcomeOptional,
  verifyPhoneNumber,
  waitForVerifyButton,
  clickOnVerifyWithSms,
  doTransferFromDesktop,
  doTransferFromMobile,
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

const userTIN = '123456789';
const beneficialOwner1Name = 'Bob';
const beneficialOwner1LastName = 'Lee';
const beneficialOwner1Email = 'boblee@acme.com';
const beneficialOwner1Phone = '6178408644';
const businessName = 'Business name';
const businessNameOptional = 'Optional name';

test('E2E.KYB.flow #ci', async ({ browser, browserName, page, isMobile }) => {
  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_5zu2usM1ilTzDnqQpaZ6Sg';

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

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillBasicDataKYB(
    { frame },
    {
      businessName,
      businessNameOptional,
      userTIN,
    },
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillAddressKYB({ frame, page }, { addressLine1, city, zipCode });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillBeneficialOwners(
    { frame },
    {
      beneficialOwner1Email,
      beneficialOwner1LastName,
      beneficialOwner1Name,
      beneficialOwner1Phone,
      userFirstName: firstName,
      userLastName: lastName,
    },
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  // #region Confirm your business data
  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2
    .waitFor({ state: 'attached', timeout: 3000 })
    .catch(() => false);
  await clickOnContinue({ frame });
  await page.waitForLoadState();
  // #endregion

  // #region Basic data
  const basicH2 = frame.getByText('Basic data').first();
  await basicH2
    .waitFor({ state: 'attached', timeout: 3000 })
    .catch(() => false);

  const dobField = frame.getByLabel('Date of Birth').first();
  await dobField.waitFor({ state: 'attached', timeout: 3000 });
  await dobField.type(dob, { delay: 100 });

  await clickOnContinue({ frame });
  await page.waitForLoadState();
  // #endregion

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

  if (isMobile /* eslint-disable-line playwright/no-conditional-in-test*/) {
    const newPage = await doTransferFromMobile({
      frame,
      browser,
    });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await newPage.waitForTimeout(5000); // takes 3 seconds for the new tab to close
  } else {
    await doTransferFromDesktop({
      page,
      frame,
      browser,
    });
    await page.waitForLoadState();
  }

  await expect(page.getByTestId('result').first()).toContainText('_');
});
