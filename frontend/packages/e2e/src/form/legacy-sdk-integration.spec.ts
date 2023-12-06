import { expect, test } from '@playwright/test';

import {
  decryptData,
  fillCardData,
  saveFormViaRef,
  waitForFormLoad,
} from './utils/commands';
import { API_SECRET_KEY_PROD } from './constants';

const name = 'Piip Penguin';
const number = '378282246310005';
const cvc = '1234';
const zip = '12345';

test('form.legacy-sdk-integration', async ({ browserName, page, request }) => {
  test.setTimeout(120000);
  const fpUserId = 'fp_id_test_LY6hjzRiEQNCsObp4HnNM7'; // From prod acme inc.
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.goto(
    `https://footprint-js-3-7-1.preview.onefootprint.com/form?flow=${flowId}&userId=${fpUserId}&cardAlias=${flowId}#${API_SECRET_KEY_PROD}`,
  );
  await page.waitForLoadState();

  const frame = await waitForFormLoad({ page });

  // Fill the form and save it
  await fillCardData({
    frame,
    data: { name, number, cvc, expiration: '12/35', zip, country: 'US' },
  });
  await saveFormViaRef({ page });
  await expect(page.getByTestId('result').first()).toContainText('completed');
  await expect(page.getByTestId('ref-result').first()).toContainText(
    'saved via ref',
  );

  await decryptData({
    api: 'prod',
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
