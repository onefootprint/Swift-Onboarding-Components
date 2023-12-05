import { expect, test } from '@playwright/test';

import {
  decryptData,
  fillCardData,
  initializeForm,
  saveFormViaRef,
  waitForFormLoad,
} from './utils/commands';

const name = 'Piip Penguin';
const number = '378282246310005';
const cvc = '1234';
const zip = '12345';

test('form.save-via-ref #ci', async ({ browserName, page, request }) => {
  test.setTimeout(120000);
  const fpUserId = 'fp_id_test_xeOIJs8bGpBVfeu1qma1QY';
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.goto(`/components/form?flow=${flowId}`);
  await page.waitForLoadState();

  await initializeForm({ page, fpUserId, flowId });
  const frame = await waitForFormLoad({ page });

  // Fill the form and save it
  await fillCardData({
    frame,
    data: { name, number, cvc, expiration: '12/35', zip, country: 'US' },
  });
  await saveFormViaRef({ page });
  const refSuccessToast = page.getByText('Successfully saved via ref').first();
  await refSuccessToast.waitFor({ state: 'attached', timeout: 3000 });
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

  expect(1).toBe(1);
});
