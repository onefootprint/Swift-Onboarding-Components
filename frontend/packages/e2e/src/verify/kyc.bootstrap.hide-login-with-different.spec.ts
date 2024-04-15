import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  selectOutcomeOptional,
  waitForVerifyButton,
} from './utils/commands';

test('E2E.Bootstrap #ci', async ({ browserName, page, isMobile }) => {
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test

  test.setTimeout(120000);
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

  // Check that "Log in with a different account" is not visible
  await expect(
    frame.getByText('Log in with a different account'),
  ).not.toBeAttached();

  return expect(1).toBe(1);
});
