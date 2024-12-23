import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnYes,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';
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
    async args => {
      const [secretKey, pbKey, backendUrl, personal, business] = args;
      const id = personal as typeof PERSONAL;
      const biz = business as typeof BUSINESS;
      const response = await fetch(`${backendUrl}/onboarding/session`, {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          bootstrap_data: {
            'business.name': biz.name,
            'business.phone_number': `+${biz.phoneNumber}`,
            'business.tin': biz.tin,
            'business.address_line1': biz.addressLine1,
            'business.address_line2': biz.addressLine2,
            'business.city': biz.city,
            'business.state': biz.state,
            'business.zip': biz.zipCode,
            'business.country': biz.country,
            'business.formation_date': biz.formationDate,

            'id.first_name': id.firstName,
            'id.last_name': id.lastName,
            'id.email': id.email,
            'id.phone_number': `+${id.phone}`,
            'id.ssn9': id.ssn,
            'id.dob': id.dob,
            'id.address_line1': id.addressLine1,
            'id.address_line2': id.addressLine2,
            'id.city': id.city,
            'id.state': id.state,
            'id.zip': id.zipCode,
            'id.country': id.country,
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
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}&ob_key=${session.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB pbtok_ session with id.xxx and business.xxx #ci', async ({ page, isMobile }) => {
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

  const letsKYB = frame.getByText("Let's get to know your business!").first();
  await letsKYB.waitFor({ state: 'attached', timeout: 10000 });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame.getByText('Confirm your business data').first().waitFor({ state: 'attached', timeout });

  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Edit' }).click();
  expect(await frame.locator('input[name="bos.0.firstName"]').first().inputValue()).toBe(PERSONAL.firstName);
  expect(await frame.locator('input[name="bos.0.lastName"]').first().inputValue()).toBe(PERSONAL.lastName);

  const primaryOwnerStake = frame.locator('input[name="bos.0.ownershipStake"]').first();
  expect(await primaryOwnerStake.inputValue()).toBeFalsy();
  await primaryOwnerStake.clear();
  await primaryOwnerStake.fill('51');
  await frame.getByTestId('beneficial-owners').getByRole('button', { name: 'Save' }).click();
  await page.waitForLoadState();

  const modalMissingBos = frame.getByLabel('It appears that there are missing beneficial owners.').first();
  await modalMissingBos.waitFor({ state: 'attached', timeout }).then(() => modalMissingBos.fill('e2e test'));

  await clickOnYes(frame);
  await page.waitForLoadState();

  await modalMissingBos.waitFor({ state: 'detached', timeout });

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout }).catch(() => false);

  await expect(frame.getByText(BUSINESS.name).first()).toBeAttached();
  await expect(frame.getByText(`${BUSINESS.addressLine1}, ${BUSINESS.addressLine2}`).first()).toBeAttached();
  await expect(
    frame.getByText(`${BUSINESS.city}, ${BUSINESS.state}, ${BUSINESS.zipCode}, ${BUSINESS.country}`).first(),
  ).toBeAttached();
  await expect(frame.getByText('51%').first()).toBeAttached();
});
