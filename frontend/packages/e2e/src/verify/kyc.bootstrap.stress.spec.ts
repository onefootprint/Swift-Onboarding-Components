import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  selectOutcomeOptional,
  waitForVerifyButton,
} from './utils/commands';

const email = 'piip@onefootprint.com';
const phoneNumber = '+15555550100';

const numberOfTests = 30;

for (let i = 0; i < numberOfTests; i++) {
  test(`E2E.Bootstrap ${i} #stress`, async ({ browserName, page }) => {
    test.setTimeout(120000);
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
    const bootstrapData = {
      'id.email': email,
      'id.phone_number': phoneNumber,
    };

    await page.goto(
      `/e2e?flow=${flowId}&user_data=${encodeURIComponent(
        JSON.stringify(bootstrapData),
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

    await expect(
      frame.getByText('Log in with a different account'),
    ).toBeAttached();
  });
}
