import { expect, test } from '@playwright/test';

import { clickOnContinue, clickOnSave } from '../utils/commands';

const apiSecretKey = process.env.E2E_ACME_SECRET_API_KEY_DEV || '';

const apiBaseUrl =
  process.env.API_BASE_URL || 'http://api.dev.onefootprint.com';

const cardholderName = 'Piip Penguin';
const cardNumber = '378282246310005';
const cvc = '1234';
const zipCode = '12345';

test('form.basic #ci', async ({ browser, browserName, page, request }) => {
  const fpUserId = 'fp_id_test_xeOIJs8bGpBVfeu1qma1QY';
  const context = await browser.newContext();
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;
  await page.goto(`/components/form?flow=${flowId}`);
  await page.waitForLoadState();

  const userIdField = page.getByLabel(/footprint user id/i).first();
  await userIdField.clear();
  await userIdField.fill(fpUserId);

  await page
    .getByLabel(/api secret key/i)
    .first()
    .fill(apiSecretKey);
  await page
    .getByLabel(/card alias/i)
    .first()
    .fill(flowId);

  await page.getByLabel('Name').first().click();
  await page.getByLabel('Partial address').first().click();

  await clickOnContinue({ frame: page });

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  const header = frame.getByText('Card information').first();
  await header.waitFor({ state: 'attached', timeout: 3000 }).catch(() => false);

  await frame.getByLabel('Cardholder name').first().fill(cardholderName);
  await frame.getByLabel('Card number').first().fill(cardNumber);
  await frame.getByLabel('CVC').first().fill(cvc);
  await frame.getByLabel('Expiry date').first().fill('12/35');
  await frame.getByLabel('Zip code').first().fill(zipCode);

  const requestPromise = page.waitForRequest('**/users/vault');
  await clickOnSave({ frame });
  const req = await requestPromise;
  const res = await req.response();
  expect(res?.status()).toBe(200);

  const response = await request.post(
    `${apiBaseUrl}/users/${fpUserId}/vault/decrypt`,
    {
      data: {
        fields: [
          `card.${flowId}.name`,
          `card.${flowId}.number`,
          `card.${flowId}.cvc`,
          `card.${flowId}.expiration`,
          `card.${flowId}.billing_address.zip`,
          `card.${flowId}.billing_address.country`,
        ],
        reason: 'E2E Form Basic test',
      },
      headers: {
        'X-Footprint-Secret-Key': apiSecretKey,
      },
    },
  );
  const decryptedData = await response.json();
  expect(decryptedData).toEqual({
    [`card.${flowId}.name`]: cardholderName,
    [`card.${flowId}.number`]: cardNumber,
    [`card.${flowId}.expiration`]: '12/2035',
    [`card.${flowId}.cvc`]: cvc,
    [`card.${flowId}.billing_address.country`]: 'US',
    [`card.${flowId}.billing_address.zip`]: zipCode,
  });

  await context.close();
});
