import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  doLivenessCheck,
  fillAddress,
  fillNameAndDoB,
  fillEmail,
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

test('KYC for env.NEXT_PUBLIC_E2E_TENANT_PK', async ({
  browserName,
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto('/e2e');
  await page.waitForLoadState();

  const verifyBtn = page.locator('.footprint-verify-button').first();
  await verifyBtn
    .waitFor({ state: 'attached', timeout: 20000 })
    .then(() => true)
    .catch(() => false);

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

  await doLivenessCheck({ page, frame, browser }, { flowId });

  console.log(`end of -> KYC for env.NEXT_PUBLIC_E2E_TENANT_PK:${flowId}`);
  await context.close();
  return expect(frame.getByTestId('result').innerText).toBeDefined();
});
