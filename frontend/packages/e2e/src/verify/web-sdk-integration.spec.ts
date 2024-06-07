import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  confirmData,
  doTransferFromDesktop,
  doTransferFromMobile,
  selectOutcomeOptional,
  verifyPhoneNumber,
} from './utils/commands';

const email = 'piip@onefootprint.com';
const phoneNumber = '+15555550100';
const firstName = 'John';
const lastName = 'Doe';
const dob = '01/01/1990';
const addressLine1 = '123 Main St';
const addressLine2 = 'Apt 1';
const city = 'San Francisco';
const state = 'CA';
const zipCode = '94105';
const country = 'US';
const ssn9 = '123412345';

const bootstrapData = {
  'id.email': email,
  'id.phone_number': phoneNumber,
  'id.first_name': firstName,
  'id.last_name': lastName,
  'id.dob': dob,
  'id.address_line1': addressLine1,
  'id.address_line2': addressLine2,
  'id.city': city,
  'id.state': state,
  'id.zip': zipCode,
  'id.country': country,
  'id.ssn9': ssn9,
};

const userData = encodeURIComponent(JSON.stringify(bootstrapData));

const Sdks = [
  {
    version: '3.2.0',
    baseUrl: 'https://footprint-js-3-2-0.preview.onefootprint.com',
  },
  {
    version: '3.4.0',
    baseUrl: 'https://footprint-js-3-4-0.preview.onefootprint.com',
  },
  {
    version: '3.6.0',
    baseUrl: 'https://footprint-js-3-6-0.preview.onefootprint.com',
  },
  {
    version: '3.7.1',
    baseUrl: 'https://footprint-js-3-7-1.preview.onefootprint.com',
  },
];

for (const { version, baseUrl } of Sdks) {
  test(`E2E.WebSDKIntegration.${version}`, async ({ browserName, page, browser, isMobile }) => {
    test.setTimeout(120000);
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
    const publicKey = 'pb_test_kZerd69hBocbsmHqAuYBE1';

    await page.goto(`${baseUrl}/?ob_key=${publicKey}&user_data=${userData}&flow=${flowId}`);

    await page.waitForLoadState();

    const btn = page.getByText('Launch Footprint').first();
    await btn.waitFor({ state: 'attached', timeout: 20000 }).then(() => true);
    await btn.click();

    await page.waitForLoadState();

    await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
      timeout: 40000,
    });
    const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

    await selectOutcomeOptional(frame, 'Success');
    await clickOnContinue(frame);
    await page.waitForLoadState();

    await verifyPhoneNumber({ frame, page });

    await page.waitForLoadState();

    await confirmData(frame, {
      firstName,
      lastName,
      dob,
      addressLine1,
      addressLine2,
      city,
      state: 'AL',
      country,
      zipCode,
      ssn: ssn9,
    });

    await clickOnContinue(frame);
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

    await expect(frame.getByTestId('result').innerText).toBeDefined();
  });
}
