import { expect, test } from '@playwright/test';
import {
  clickOnContinue,
  confirmData,
  clickOnAgree,
  clickOnConfirm,
  clickOnTakePhoto,
  doTransferFromMobile,
  fillSSN,
  selectOutcomeOptional,
  skipTransferOnDesktop,
  uploadImage,
  verifyPhoneNumber,
  waitForVerifyButton,
} from './utils/commands';

const ssn = '418437970';

test('reverse-doc', async ({ browserName, browser, page, isMobile }) => {
  test.setTimeout(120000);
  const context = await browser.newContext();
  await context.grantPermissions(['camera']);
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'pb_test_ZeSUWIlEteLWZByDjLITUL';

  await context.grantPermissions(['camera']);
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/e2e?ob_key=${key}&flow=${flowId}&user_data=${encodeURIComponent(
      JSON.stringify({
        'id.email': 'piip@onefootprint.com',
        'id.phoneNumber': '+15555550100',
      }),
    )}`,
  );
  await page.waitForLoadState();

  await waitForVerifyButton({ page });

  await page.getByRole('button', { name: 'Verify with Footprint' }).click();
  await page.waitForLoadState();

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional({ frame }, 'Success');
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  if (isMobile /* eslint-disable-line playwright/no-conditional-in-test*/) {
    const newPage = await doTransferFromMobile({
      frame,
      browser,
    });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await newPage.waitForTimeout(5000); // takes 3 seconds for the new tab to close
    return;
  }

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

  await clickOnTakePhoto({ frame });
  await page.waitForLoadState();
  await clickOnConfirm({ frame });
  await page.waitForLoadState();
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await fillSSN({ frame }, { ssn });
  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await confirmData(
    { frame },
    {
      firstName: 'Piip',
      lastName: 'Penguin',
      dob: '10/16/1986',
      addressLine1: '567 Hayes St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      ssn,
    },
  );

  await clickOnContinue({ frame });
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_');
  await context.close();
});
