import { expect, test } from '@playwright/test';

import {
  authorizeAccess,
  clickOnContinue,
  confirmData,
  doLivenessCheck,
  fillAddress,
  fillBasicData,
  fillEmail,
  fillPhoneNumber,
  fillSSN,
  selectOutcome,
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

test('smoke tests', async ({ browserName, page, browser }) => {
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.goto('/e2e');

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  const frame = page.frameLocator('iframe');

  await selectOutcome({ frame }, 'Success');
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

  await doLivenessCheck(
    {
      page,
      frame,
      browser,
    },
    {
      flowId,
    },
  );
  await authorizeAccess({ frame });
  return expect(frame.getByText('Submission completed')).toBeVisible();
});
