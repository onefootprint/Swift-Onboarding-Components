import { expect, test } from '@playwright/test';

import {
  createUser,
  decryptData,
  fillCardData,
  findMissingConfig,
  saveFormViaRef,
  waitForFormLoad,
} from './utils/commands';
import { API_SECRET_KEY_PROD } from './utils/constants';

const name = 'Piip Penguin';
const number = '378282246310005';
const cvc = '1234';
const zip = '12345';
const missingConfig = findMissingConfig();

test.describe('/components/form', () => {
  test.describe.configure({ retries: missingConfig !== undefined ? 0 : 2 });

  test('form.legacy-sdk-integration', async ({
    browserName,
    isMobile,
    page,
    request,
  }) => {
    expect(missingConfig, missingConfig?.message).toBe(undefined);

    test.setTimeout(120000);
    test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

    const fpUserId = await createUser({ api: 'prod', request }); // From prod acme inc.
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await page.goto(
      `https://footprint-js-3-7-1.preview.onefootprint.com/form?f=${flowId}&userId=${fpUserId}&cardAlias=${flowId}#${API_SECRET_KEY_PROD}`,
    );
    await page.waitForLoadState();

    const frame = await waitForFormLoad(page);

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
});
