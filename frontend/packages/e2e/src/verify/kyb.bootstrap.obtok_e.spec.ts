import { expect, test } from '@playwright/test';

import { clickOnContinue, selectOutcomeOptional, verifyAppIframeClick, verifyPhoneNumber } from './utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const pbKey = process.env.E2E_OB_KYB_KYCED_BO || 'pb_test_eWuI7QxglTuuVclccyfAk4'; // KYC all BOs
const fpSKey = process.env.E2E_ACME_SECRET_API_KEY_DEV || '';

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

  // Create a session
  const session = await page.evaluate(
    async ([secretKey, pbKey]) => {
      const response = await fetch('https://api.dev.onefootprint.com/onboarding/session', {
        method: 'POST',
        headers: {
          'X-Footprint-Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: pbKey,
          bootstrap_data: {
            'business.address_line1': '1 Infinite Way',
            'business.city': 'Cupertino',
            'business.country': 'US',
            'business.name': 'PrintFoot',
            'business.primary_owner_stake': 73,
            'business.state': 'CA',
            'business.tin': '12-1212121',
            'business.zip': '12121',
            'business.secondary_owners': [
              {
                first_name: 'Bob',
                last_name: 'Boberto',
                ownership_stake: 27,
                phone_number: '+15555550100',
                email: 'bob@onefootprint.com',
              },
            ],

            'id.address_line1': '2 Penguin way',
            'id.city': 'Boston',
            'id.country': 'US',
            'id.dob': '2000-04-12',
            'id.email': 'alex@onefootprint.com',
            'id.first_name': 'Alex',
            'id.last_name': 'Anderson',
            'id.phone_number': '+15555550100',
            'id.ssn9': '121212121',
            'id.state': 'MA',
            'id.zip': '02446',
          },
        }),
      });

      const data = (await response.json()) as { token: string };
      return data;
    },
    [fpSKey, pbKey],
  );

  expect(session).toHaveProperty('token');
  expect(session.token.startsWith('obtok_')).toBeTruthy();

  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(`/components/verify?app_url=${appUrl}&f=${flowId}#${session.token}`);
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('KYB obtok_ happy path #ci #debug', async ({ page, isMobile }) => {
  test.slow(); // ~23.63s
  test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  await expect(page.frameLocator('iframe[name^="footprint-iframe-"]').getByText(/Sandbox Mode/i)).toBeVisible({
    timeout,
  });
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  const confirmH2 = frame.getByText('Confirm your business data').first();
  await confirmH2.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);

  await expect(frame.getByText('PrintFoot').first()).toBeAttached();

  await expect(frame.getByText('1 Infinite Way').first()).toBeAttached();
  await expect(frame.getByText('Cupertino, CA, 12121, US').first()).toBeAttached();

  await expect(frame.getByText('Alex').first()).toBeAttached();
  await expect(frame.getByText('Anderson').first()).toBeAttached();
  await expect(frame.getByText('73%').first()).toBeAttached();

  await expect(frame.getByText('Bob').first()).toBeAttached();
  await expect(frame.getByText('Boberto').first()).toBeAttached();
  await expect(frame.getByText('bob@onefootprint.com').first()).toBeAttached();
  await expect(frame.getByText('+15555550100').first()).toBeAttached();
  await expect(frame.getByText('27%').first()).toBeAttached();

  await clickOnContinue(frame);
  await page.waitForLoadState();

  const confirmPersonalHeader = frame.getByText('Confirm your personal data').first();
  await confirmPersonalHeader.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false);
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(page.getByTestId('result').first()).toContainText('_', { timeout: 5000 });
});
