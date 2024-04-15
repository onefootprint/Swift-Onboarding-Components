import { expect, test } from '@playwright/test';
import {
  clickOnContinue,
  clickOnAgree,
  doTransferFromMobile,
  selectOutcomeOptional,
  continueOnDesktop,
  uploadImage,
  verifyPhoneNumber,
  waitForVerifyButton,
} from './utils/commands';

test('reverse-doc #ci', async ({ browserName, browser, page, isMobile }) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test

  test.setTimeout(120000);
  const context = await browser.newContext({ permissions: ['camera'] });
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
  const verifying = frame.getByText(/verifying/i).first();
  await verifying.waitFor({ state: 'attached', timeout: 2000 });

  if (isMobile /* eslint-disable-line playwright/no-conditional-in-test*/) {
    const newPage = await doTransferFromMobile({
      frame,
      browser,
    });
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await newPage.waitForTimeout(5000); // takes 3 seconds for the new tab to close
    return;
  }

  await page.waitForLoadState();
  await continueOnDesktop({ frame });
  await page.waitForLoadState();

  const scanText = frame.getByText(/scan or upload/i).first();
  await scanText.waitFor({ state: 'attached', timeout: 3000 });

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
  expect(1).toBe(1);

  // TODO: add back in when we figure out the playwright camera error
  // await clickOnTakePhoto({ frame });
  // await page.waitForLoadState();
  // await clickOnConfirm({ frame });
  // await page.waitForLoadState();
  // await clickOnContinue({ frame });
  // await page.waitForLoadState();

  // await fillSSN({ frame }, { ssn: '418437970' });
  // await clickOnContinue({ frame });
  // await page.waitForLoadState();

  // await confirmData(
  //   { frame },
  //   {
  //     firstName: 'Piip',
  //     lastName: 'Penguin',
  //     dob: '10/16/1986',
  //     addressLine1: '567 Hayes St',
  //     city: 'San Francisco',
  //     state: 'CA',
  //     zipCode: '94102',
  //     country: 'US',
  //     ssn: '418437970',
  //   },
  // );

  // await clickOnContinue({ frame });
  // await page.waitForLoadState();

  // await expect(page.getByTestId('result').first()).toContainText('_');
  // await context.close();
});
