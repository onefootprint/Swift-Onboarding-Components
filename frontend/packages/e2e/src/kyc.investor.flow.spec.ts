import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  fillSSN,
  selectOutcomeOptional,
  verifyPhoneNumber,
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

test('KYC.Investor', async ({ browserName, page, browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto('/preview?ob_key=ob_test_3xYoHcfrkxuOGNy8vILxh4');
  await page.waitForLoadState();

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
  await clickOnContinue({ frame });
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
    { firstName, lastName, dob, addressLine1, city, zipCode },
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await frame.getByLabel('Occupation').first().fill('Occupation');
  await frame.getByLabel('Employer').first().fill('Employer');
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await frame.getByLabel('$100,001 - $200,000').first().check();
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await page.waitForTimeout(1000); // eslint-disable-line playwright/no-wait-for-timeout
  await frame.getByLabel('$100,001 - $200,000').first().check();
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await frame.getByLabel('Growth').first().click();
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await frame.getByLabel('Moderate').first().click();
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  const noneBtn = frame
    .getByRole('button')
    .filter({ hasText: /none/i })
    .first();
  await noneBtn
    .waitFor({ state: 'attached', timeout: 2000 })
    .then(() => noneBtn.click())
    .then(() => true)
    .catch(() => false);
  await page.waitForLoadState();

  console.log(`end of -> KYC.Investor:${flowId}`);
  await context.close();

  return expect(1).toBe(1);
});
