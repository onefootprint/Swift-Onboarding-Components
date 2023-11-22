import { expect, test } from '@playwright/test';

import { clickOnContinue } from '../utils/commands';
import {
  decryptData,
  fillCardData,
  initializeForm,
  saveFormViaRef,
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
  await clickOnContinue({ frame: page });

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

  await fillCardData({
    frame,
    data: { name, number, cvc, expiration: '12/35', zip, country: 'US' },
  });
  await saveFormViaRef({ frame, page });
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
