import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  fillAddress,
  fillSSN,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_YIELDSTREET || 'pb_test_bH2tmxMPBCI8Gujjb90P3d';
const fpSKey = process.env.E2E_ACME_SECRET_API_KEY_DEV || '';

const businessAs = 'Foot';
const businessAddressLine1 = '1 Hayes St';
const businessAddressLine2 = 'Ap 123';
const businessZipCode = '94117';
const businessCity = 'San Francisco';
const businessState = 'CA';
const businessCountry = 'US';

const idFirstName = 'Piip';
const idMiddleName = 'Bird';
const idLastName = 'Penguin';
const idDob = '01/01/1990';
const idPhone = '+15555550100';
const idEmail = 'sandbox@onefootprint.com';
const idAddressLine1 = '432 3rd Ave';
const idCity = 'Seward';
const idZipCode = '99664';
const idSsn = '418437970';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  // Create a user
  const user = await page.evaluate(async (secretKey: string) => {
    const response = await fetch('https://api.dev.onefootprint.com/users', {
      method: 'POST',
      headers: {
        'X-Footprint-Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'id.first_name': 'Piip',
        'id.last_name': 'Penguin',
        'id.email': 'sandbox@onefootprint.com',
        'id.phone_number': '+15555550100',
      }),
    });

    const data = (await response.json()) as { id: string };
    return data;
  }, fpSKey);

  expect(user).toHaveProperty('id');

  // Create a business
  const business = await page.evaluate(async (secretKey: string) => {
    const response = await fetch('https://api.dev.onefootprint.com/businesses', {
      method: 'POST',
      headers: {
        'X-Footprint-Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'business.name': 'Printfoot',
        'business.tin': '121231234',
        'business.address_line1': '1 Hayes St',
        'business.city': 'San Francisco',
        'business.state': 'CA',
        'business.country': 'US',
      }),
    });

    const data = (await response.json()) as { id: string };
    return data;
  }, fpSKey);

  expect(business).toHaveProperty('id');

  // Link the user as an owner of the business
  const linkOwner = await page.evaluate(
    async ([secretKey, fpId, fpBid]) => {
      const response = await fetch(`https://api.dev.onefootprint.com/businesses/${fpBid}/owners`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fp_id: fpId, ownership_stake: 20 }),
      });

      const data = (await response.json()) as {};
      return data;
    },
    [fpSKey, user.id, business.id],
  );

  expect(linkOwner).toEqual({});

  // Create a user-specific session token
  const userSession = await page.evaluate(
    async ([secretKey, playBookKey, fpId, fpBid]) => {
      const response = await fetch(`https://api.dev.onefootprint.com/users/${fpId}/token`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fp_bid: fpBid,
          kind: 'onboard',
          key: playBookKey,
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey, user.id, business.id],
  );

  expect(userSession).toHaveProperty('token');

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}#${userSession.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB With linked beneficial owner #ci', async ({ page, isMobile }) => {
  test.slow(); // ~48.9s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Verify your contact info')).toBeAttached();
  await expect(frame.getByText('Log in using one of the options below.')).toBeAttached();

  await frame.locator('button').filter({ hasText: 'Send code to +1 (•••) •••‑••' }).first().click();
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  const kybHeader = frame.getByText("Let's get to know your business!").first();
  await kybHeader.waitFor({ state: 'attached', timeout: 6000 }).catch(() => false);
  await clickOnContinue(frame);

  await clickOnContinue(frame);
  await expect(frame.getByText('Zip code cannot be empty')).toBeAttached();
  await frame.getByLabel('Zip code').first().fill(businessZipCode);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  await expect(frame.getByText('Printfoot').first()).toBeAttached();

  await frame.getByTestId('basic-data').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await frame.getByLabel('Doing Business As (optional)').first().fill(businessAs);

  await frame.getByTestId('basic-data').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(businessAs).first()).toBeAttached();
  await expect(frame.getByText('•••••••••').first()).toBeAttached();

  await frame.getByTestId('business-address').getByRole('button', { name: 'Edit' }).click();
  await page.waitForLoadState();

  await frame.getByLabel('Address line 2').first().fill(businessAddressLine2);

  await frame.getByTestId('business-address').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  await expect(frame.getByText(businessAddressLine1).first()).toBeAttached();
  await expect(frame.getByText(businessAddressLine2).first()).toBeAttached();
  await expect(frame.getByText(businessCity).first()).toBeAttached();
  await expect(frame.getByText(businessState).first()).toBeAttached();
  await expect(frame.getByText(businessZipCode).first()).toBeAttached();
  await expect(frame.getByText(businessCountry).first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Basic Data').first()).toBeAttached();

  await frame.getByLabel('Middle name (optional)').first().fill(idMiddleName);
  await frame.getByLabel('Date of Birth').first().fill(idDob);

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillAddress({ frame, page }, { addressLine1: idAddressLine1, city: idCity, zipCode: idZipCode });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await fillSSN(frame, { ssn: idSsn });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText(idFirstName)).toBeAttached();
  await expect(frame.getByText(idMiddleName)).toBeAttached();
  await expect(frame.getByText(idLastName)).toBeAttached();
  await expect(frame.getByText(idDob)).toBeAttached();
  await expect(frame.getByText(idPhone)).toBeAttached();
  await expect(frame.getByText(idEmail)).toBeAttached();
  await expect(frame.getByText(idAddressLine1)).toBeAttached();
  await expect(frame.getByText(idCity)).toBeAttached();
  await expect(frame.getByText(idZipCode)).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText('Add a passkey')).toBeAttached();

  await frame.getByRole('button').filter({ hasText: 'Continue on Desktop' }).first().click();
  await page.waitForLoadState();

  return expect(frame.getByTestId('result').innerText).toBeDefined();
});
