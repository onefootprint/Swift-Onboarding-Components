import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  confirmData,
  fillEmail,
  fillPhoneNumber,
  selectOutcomeOptional,
  verifyPhoneNumber,
} from './utils/commands';
import getMobileSdkBifrostUrlFragment from './utils/get-mobile-sdk-bifrost-url-fragment';

const bifrostUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';

const testUserData = {
  'id.email': 'piip@onefootprint.com',
  'id.phone_number': '+15555550100',
  'id.first_name': 'John',
  'id.last_name': 'Doe',
  'id.dob': '01/01/1990',
  'id.address_line1': '123 Main St',
  'id.address_line2': 'Apt 1',
  'id.city': 'San Francisco',
  'id.state': 'CA',
  'id.zip': '94105',
  'id.country': 'US',
  'id.ssn9': '123412345',
};

const testOptions = {
  showCompletionPage: true,
  showLogo: true,
};

const testL10n = {
  locale: 'en-US',
};

const SdkUrls = [
  {
    format: '/?public_key=<PUBLIC_KEY>',
    urlFragment: getMobileSdkBifrostUrlFragment({}),
    hasUserData: false,
  },
  {
    format: '/?public_key=<PUBLIC_KEY>#<ENCODED_USER_DATA>',
    urlFragment: getMobileSdkBifrostUrlFragment({ userData: testUserData }),
    hasUserData: true,
  },
  {
    format: '/?public_key=<PUBLIC_KEY>#<ENCODED_USER_DATA>__<ENCODED_OPTIONS>',
    urlFragment: getMobileSdkBifrostUrlFragment({
      userData: testUserData,
      options: testOptions,
    }),
    hasUserData: true,
  },
  {
    format: '/?public_key=<PUBLIC_KEY>#<ENCODED_USER_DATA>__<ENCODED_OPTIONS>__<ENCODED_LOCALE>',
    urlFragment: getMobileSdkBifrostUrlFragment({
      userData: testUserData,
      options: testOptions,
      l10n: testL10n,
    }),
    hasUserData: true,
  },
];

for (const { format, urlFragment, hasUserData } of SdkUrls) {
  test(`E2E.MobileSDKIntegration.${format} #ci`, async ({ browserName, page, isMobile }) => {
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test

    test.setTimeout(120000);
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
    await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
    const publicKey = 'ob_test_Twvblr3NUeDzPuFteI1OCh';
    await page.goto(`${bifrostUrl}/?public_key=${publicKey}&flow=${flowId}${urlFragment}`);

    await page.waitForLoadState();

    await selectOutcomeOptional(page, 'Success');
    await clickOnContinue(page);
    await page.waitForLoadState();

    /* eslint-disable-next-line playwright/no-conditional-in-test*/
    if (!hasUserData) {
      await fillEmail(page, testUserData['id.email']);
      await clickOnContinue(page);
      await page.waitForLoadState();

      await fillPhoneNumber(page, '5555550100');
      await clickOnVerifyWithSms(page);
      await page.waitForLoadState();
    }

    await verifyPhoneNumber({ frame: page, page });
    await page.waitForLoadState();

    /* eslint-disable-next-line playwright/no-conditional-in-test*/
    if (hasUserData) {
      await confirmData(page, {
        firstName: testUserData['id.first_name'],
        lastName: testUserData['id.last_name'],
        dob: testUserData['id.dob'],
        addressLine1: testUserData['id.address_line1'],
        addressLine2: testUserData['id.address_line2'],
        city: testUserData['id.city'],
        state: 'AL',
        country: testUserData['id.country'],
        zipCode: testUserData['id.zip'],
        ssn: testUserData['id.ssn9'],
      });
    }

    expect(1).toBe(1);
  });
}
