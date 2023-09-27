import { expect, test } from '@playwright/test';

import {
  authorizeAccess,
  confirmData,
  doLivenessCheck,
  fillSSN,
  clickOnContinue,
  fillAddress,
  fillAddressKYB,
  fillBasicDataKYB,
  fillBeneficialOwners,
  fillEmail,
  fillPhoneNumber,
  selectOutcome,
  verifyPhoneNumber,
} from './utils/commands';

const userFirstName = 'Jane';
const userLastName = 'Doe';
const beneficialOwner1Name = 'Bob';
const beneficialOwner1LastName = 'Lee';
const beneficialOwner1Email = 'boblee@acme.com';
const beneficialOwner1Phone = '6178408644';
const userDob = '01/01/1990';
const userEmail = 'janedoe@acme.com';
const userPhone = '5555550100';
const userAddressLine1 = '432 3rd Ave';
const userCity = 'Seward';
const userZipCode = '99664';
const userSSN = '418437970';
const userTIN = '123456789';
const businessName = 'Business name';
const businessNameOptional = 'Optional name';

test('KYB basic flow', async ({ browser, browserName, page }) => {
  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_5zu2usM1ilTzDnqQpaZ6Sg';
  await page.goto(`/preview?ob_key=${key}&flow=${flowId}`);

  const verifyCTA = page.locator('.footprint-verify-button').first();
  await verifyCTA.waitFor({ state: 'attached', timeout: 20000 }); // Increasing the waiting time for CI

  await page
    .getByRole('button', { name: 'Verify with Footprint' })
    .first()
    .click();
  const frame = page.frameLocator('iframe');

  await selectOutcome({ frame }, 'Success');
  await clickOnContinue({ frame });

  await fillEmail({ frame }, { email: userEmail });
  await clickOnContinue({ frame });

  await fillPhoneNumber({ frame }, { phoneNumber: userPhone });
  await clickOnContinue({ frame });

  await verifyPhoneNumber({ frame, page });

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 20000 });
  await clickOnContinue({ frame });

  await fillBasicDataKYB(
    { frame },
    {
      businessName,
      businessNameOptional,
      userTIN,
    },
  );
  await clickOnContinue({ frame });

  await fillAddressKYB(
    { frame, page },
    {
      addressLine1: userAddressLine1,
      city: userCity,
      zipCode: userZipCode,
    },
  );
  await clickOnContinue({ frame });

  await fillBeneficialOwners(
    { frame },
    {
      beneficialOwner1Email,
      beneficialOwner1LastName,
      beneficialOwner1Name,
      beneficialOwner1Phone,
      userFirstName,
      userLastName,
    },
  );
  await clickOnContinue({ frame });

  // #region Confirm your business data
  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 20000 });
  await clickOnContinue({ frame });
  // #endregion

  // #region Basic data
  const basicH2 = frame.getByText('Basic data').first();
  await basicH2.waitFor({ state: 'attached', timeout: 20000 });

  const dob = frame.getByLabel('Date of Birth').first();
  await dob.waitFor({ state: 'attached', timeout: 20000 });
  await dob.type(userDob, { delay: 100 });

  await clickOnContinue({ frame });
  // #endregion

  await fillAddress(
    { frame, page },
    {
      addressLine1: userAddressLine1,
      city: userCity,
      zipCode: userZipCode,
    },
  );
  await clickOnContinue({ frame });

  await fillSSN({ frame }, { ssn: userSSN });
  await clickOnContinue({ frame });

  await confirmData(
    { frame },
    {
      firstName: userFirstName,
      lastName: userLastName,
      dob: userDob,
      addressLine1: userAddressLine1,
      city: userCity,
      zipCode: userZipCode,
    },
  );
  await clickOnContinue({ frame });

  await doLivenessCheck({ page, frame, browser }, { flowId });
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(2500); // Give time for QR check

  await authorizeAccess({ frame });

  expect(1).toBe(1);
});
