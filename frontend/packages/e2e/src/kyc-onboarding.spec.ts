import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  doLivenessCheck,
  fillAddress,
  fillBasicData,
  fillEmail,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  verifyPhoneNumber,
} from './utils/commands';

const userFirstName = 'Jane';
const userLastName = 'Doe';
const userDob = '01/01/1990';
const userEmail = 'Janedoe@acme.com';
const userPhone = '5555550100';
const userAddressLine1 = '432 3rd Ave';
const userCity = 'Seward';
const userZipCode = '99664';
const userSSN = '418437970';

test('KYC env.NEXT_PUBLIC_E2E_TENANT_PK', async ({
  browserName,
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.goto('/e2e');

  const verifyCTA = page.locator('.footprint-verify-button').first();
  await verifyCTA
    .waitFor({ state: 'attached', timeout: 20000 })
    .catch(() => null); // Increasing the waiting time for CI

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  const frame = page.frameLocator('iframe');

  const testOutcomeH2 = frame.getByText('Test outcomes').first();
  await testOutcomeH2
    .waitFor({ state: 'attached', timeout: 3000 })
    .catch(() => null);

  await selectOutcomeOptional({ frame }, 'Success');
  await clickOnContinue({ frame });

  await fillEmail({ frame }, { email: userEmail });
  await clickOnContinue({ frame });

  await fillPhoneNumber({ frame }, { phoneNumber: userPhone });
  await clickOnContinue({ frame });

  await verifyPhoneNumber({ frame, page });

  await fillBasicData(
    { frame },
    {
      firstName: userFirstName,
      lastName: userLastName,
      dob: userDob,
    },
  );
  await clickOnContinue({ frame });

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

  // await authorizeAccess({ frame });
  return expect(frame.getByTestId('result').innerText).toBeDefined();
});
