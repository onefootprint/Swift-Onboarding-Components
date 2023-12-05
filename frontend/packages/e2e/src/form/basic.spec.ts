import { test, expect } from '@playwright/test';

import { clickOnCancel, clickOnYes } from '../utils/commands';
import {
  decryptData,
  fillCardData,
  initializeForm,
  saveForm,
  waitForFormLoad,
} from './utils/commands';

const name = 'Piip Penguin';
const number = '378282246310005';
const cvc = '1234';
const zip = '12345';

test('form.basic #ci', async ({ browserName, page, request }) => {
  test.setTimeout(120000);
  const fpUserId = 'fp_id_test_xeOIJs8bGpBVfeu1qma1QY';
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.goto(`/components/form?flow=${flowId}`);
  await page.waitForLoadState();

  await initializeForm({ page, fpUserId, flowId });
  const frame = await waitForFormLoad({ page });

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
  await clickOnCancel({ frame });
  await clickOnYes({ frame });
  const cancelToast = page.getByText('User canceled form').first();
  await cancelToast.waitFor({ state: 'attached', timeout: 3000 });

  return expect(1).toBe(1);
});
