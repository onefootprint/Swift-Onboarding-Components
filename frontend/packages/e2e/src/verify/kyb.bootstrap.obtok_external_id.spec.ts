import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from '../utils/commands';
import { BUSINESS, PERSONAL } from '../utils/constants';

const backendUrl = process.env.E2E_BACKEND_URL || 'https://api.dev.onefootprint.com';
const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB || 'pb_test_irxUbxvVOevFXVmhIvHdrf';
const fpSKey = process.env.E2E_SECRET_API_KEY_DEV || '';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  // Create a session
  const session = await page.evaluate(
    async ([secretKey, pbKey, backendUrl, personal, business]) => {
      const id = personal as typeof PERSONAL;
      const biz = business as typeof BUSINESS;
      const businessExternalId = `e2e-${Math.floor(Math.random() * 1000000000) + 1}`;
      const response = await fetch(`${backendUrl}/onboarding/session`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          business_external_id: businessExternalId,
          bootstrap_data: {
            'business.address_line1': biz.addressLine1,
            'business.address_line2': biz.addressLine2,
            'business.city': biz.city,
            'business.country': biz.country,
            'business.name': biz.name,
            'business.state': biz.state,
            'business.tin': biz.tin,
            'business.zip': biz.zipCode,

            'business.primary_owner_stake': 73,
            'business.secondary_owners': [
              {
                first_name: biz.bo2Name,
                last_name: biz.bo2LastName,
                ownership_stake: 27,
                phone_number: `+${biz.bo2Phone}`,
                email: biz.bo2Email,
              },
            ],

            'id.address_line1': id.addressLine1,
            'id.city': id.city,
            'id.country': id.country,
            'id.dob': id.dob,
            'id.email': id.email,
            'id.first_name': id.firstName,
            'id.last_name': id.lastName,
            'id.phone_number': `+${id.phone}`,
            'id.ssn9': id.ssn9,
            'id.state': id.state,
            'id.zip': id.zipCode,
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey, backendUrl, PERSONAL, BUSINESS],
  );

  expect(session).toHaveProperty('token');
  expect(session.token.startsWith('pbtok_')).toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  // NOTE: this is the legacy syntax where the pbtok is passed in the `authToken` argument of the SDK instead
  // of in the `publicKey` argument. Only Yieldstreet is doing this. We can migrate to pass as the `publicKey`
  // in the future once Yieldstreet has migrated away from this flow
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}#${session.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB pbtok_ happy path #ci', async ({ page, isMobile }) => {
  test.slow(); // ~23.63s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  // TODO: uncomment once we show the business introduction screen
  // const letsKYB = frame.getByText("Let's get to know your business!").first();
  // await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  // await clickOnContinue(frame);
  // await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  await expect(frame.getByText(BUSINESS.name).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.addressLine1).first()).toBeAttached();
  await expect(
    frame.getByText(`${BUSINESS.city}, ${BUSINESS.state}, ${BUSINESS.zipCode}, ${BUSINESS.country}`).first(),
  ).toBeAttached();

  await expect(frame.getByText(PERSONAL.firstName).first()).toBeAttached();
  await expect(frame.getByText(PERSONAL.lastName).first()).toBeAttached();
  await expect(frame.getByText('73%').first()).toBeAttached();

  await expect(frame.getByText(BUSINESS.bo2Name).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2LastName).first()).toBeAttached();
  await expect(frame.getByText(BUSINESS.bo2Email).first()).toBeAttached();
  await expect(frame.getByText(`+${BUSINESS.bo2Phone}`).first()).toBeAttached();
  await expect(frame.getByText('27%').first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmPersonalHeader = frame.getByText('Confirm your personal data').first();
  await confirmPersonalHeader.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_', { timeout: 5000 });
});
