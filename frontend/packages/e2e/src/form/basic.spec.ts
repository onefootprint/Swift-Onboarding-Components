import { test, expect } from '@playwright/test';

import { clickOnCancel, clickOnYes } from '../verify/utils/commands';
import {
  findMissingConfig,
  decryptData,
  fillCardData,
  initializeForm,
  saveForm,
  waitForFormLoad,
  createUser,
} from './utils/commands';

const formAppUrl =
  (process.env.E2E_COMPONENTS_BASE_URL || 'http://localhost:3010') + '/form';

const name = 'Piip Penguin';
const number = '378282246310005';
const cvc = '1234';
const zip = '12345';
const missingConfig = findMissingConfig();

test.describe('/components/form', () => {
  test('form.basic #ci', async ({ browserName, isMobile, page, request }) => {
    expect(missingConfig, missingConfig?.message).toBe(undefined);

    test.setTimeout(120000);
    test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

    const fpUserId = await createUser({ request });
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await page.goto(`/components/form?app_url=${formAppUrl}&f=${flowId}`);
    await page.waitForLoadState();

    await initializeForm({ page, fpUserId, flowId });
    const frame = await waitForFormLoad(page);

    await fillCardData({
      frame,
      data: { name, number, cvc, expiration: '12/35', zip, country: 'US' },
    });
    await saveForm({ frame, page });
    const completeToast = page.getByText('Successfully completed form').first();
    await completeToast.waitFor({ state: 'attached', timeout: 3000 });

    await decryptData({
      request,
      fpUserId,
      cardAlias: flowId,
      data: {
        name: name,
        number,
        cvc,
        expiration: '12/2035',
        zip,
        country: 'US',
      },
    });

    // Cancel the form if not already cancelled
    await clickOnCancel(frame);
    await clickOnYes(frame);
    const cancelToast = page.getByText('User canceled form').first();
    await cancelToast.waitFor({ state: 'attached', timeout: 3000 });
  });
});
