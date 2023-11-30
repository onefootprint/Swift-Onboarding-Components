import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  fillAddress,
  fillEmail,
  fillNameAndDoB,
  fillPhoneNumber,
  selectOutcomeOptional,
  skipTransferOnDesktop,
  verifyPhoneNumber,
  waitForVerifyButton,
} from './utils/commands';

const firstName = 'Jorge';
const lastName = 'Mejia';
const dob = '25/12/1990';
const email = 'jorge@mejia.com';
const phoneNumber = '5555550100';
const addressLine1 = '432 3rd Ave';
const city = 'Seward';
const zipCode = '99664';

test('E2E.es-MX.KYC.Docs #ci', async ({ browserName, isMobile, page }) => {
  test.setTimeout(120000);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_yHlPBcaJ6lnxwkkD1YLStx';
  const locale = 'es-MX';

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/e2e?ob_key=${key}&locale=${locale}&flow=${flowId}`);
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

  await frame.getByRole('button').filter({ hasText: '+52' }).first().click();
  await page.keyboard.press('u');
  await page.keyboard.press('n');
  await page.keyboard.press('i');
  await page.keyboard.press('t');
  await page.keyboard.press('Enter');

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
    },
  );
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  if (isMobile /* eslint-disable-line playwright/no-conditional-in-test*/) {
    // TODO (belce): remove isMobile conditional
    // TODO (belce): locale options need to get sent to the handoff app
    return;
    // const newPage = await doTransferFromMobile({
    //   frame,
    //   browser,
    // });
    // await newPage.waitForLoadState();
  } else {
    await skipTransferOnDesktop({ frame });
    await page.waitForLoadState();
    await expect(frame.getByRole('button', { name: 'Mexico' })).toBeVisible();
  }
});
