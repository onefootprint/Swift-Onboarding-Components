import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  selectOutcomeOptional,
  waitForVerifyButton,
} from './utils/commands';

test('E2E.Bootstrap #ci', async ({ browserName, page, browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  const key = 'ob_test_Twvblr3NUeDzPuFteI1OCh';

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  const bootstrapData = {
    'id.email': 'piip@onefootprint.com',
    'id.phone_number': '+15555550100',
  };
  await page.goto(
    `/e2e?ob_key=${key}&flow=${flowId}&user_data=${encodeURIComponent(
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

  // Check that "Login with a different account" is not visible
  await expect(
    frame.getByText('Login with a different account'),
  ).not.toBeAttached();

  await context.close();
  return expect(1).toBe(1);
});
