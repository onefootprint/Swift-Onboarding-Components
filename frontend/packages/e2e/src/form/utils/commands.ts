import { expect } from '@playwright/test';
import type { APIRequestContext, FrameLocator, Page } from '@playwright/test';
import {
  clickOn,
  clickOnContinue,
  clickOnSave,
} from '../../verify/utils/commands';
import {
  API_BASE_URL_DEV,
  API_BASE_URL_PROD,
  API_SECRET_KEY_DEV,
  API_SECRET_KEY_PROD,
} from '../constants';

type CardData = {
  name: string;
  number: string;
  cvc: string;
  expiration: string;
  zip: string;
  country: string;
};

export const findMissingConfig = (): Error | undefined => {
  if (!API_BASE_URL_DEV && !API_BASE_URL_PROD) {
    return new Error('Empty values for API_BASE_URL_DEV and API_BASE_URL_PROD');
  }

  if (!API_SECRET_KEY_DEV && !API_SECRET_KEY_DEV) {
    return new Error(
      'Empty values for API_SECRET_KEY_DEV and API_SECRET_KEY_DEV',
    );
  }

  return undefined;
};

export const waitForFormLoad = async ({
  page,
}: {
  page: Page;
}): Promise<FrameLocator> => {
  await page.waitForLoadState();
  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await page.waitForLoadState();

  const header = frame.getByText('Card information').first();
  await header
    .waitFor({ state: 'attached', timeout: 15000 })
    .catch(() => false);

  return frame;
};

export const fillCardData = async ({
  frame,
  data,
}: {
  frame: FrameLocator;
  data: CardData;
}) => {
  await frame.getByLabel('Cardholder name').first().fill(data.name);
  await frame.getByLabel('Card number').first().fill(data.number);
  await frame.getByLabel('CVC').first().fill(data.cvc);
  await frame.getByLabel('Expiry date').first().fill(data.expiration);
  await frame.getByLabel('Zip code').first().fill(data.zip);
};

export const createUser = async ({
  api = 'dev',
  request,
}: {
  api?: 'dev' | 'prod';
  request: APIRequestContext;
}) => {
  const response = await request.post(
    `${api === 'dev' ? API_BASE_URL_DEV : API_BASE_URL_PROD}/users`,
    {
      headers: {
        'X-Footprint-Secret-Key':
          api == 'dev' ? API_SECRET_KEY_DEV : API_SECRET_KEY_PROD,
      },
    },
  );
  const body = await response.json();
  return body.id;
};

export const decryptData = async ({
  api = 'dev',
  request,
  cardAlias,
  fpUserId,
  data: data,
}: {
  api?: 'dev' | 'prod';
  request: APIRequestContext;
  cardAlias: string;
  fpUserId: string;
  data: CardData;
}) => {
  const response = await request.post(
    `${
      api === 'dev' ? API_BASE_URL_DEV : API_BASE_URL_PROD
    }/users/${fpUserId}/vault/decrypt`,
    {
      data: {
        fields: [
          `card.${cardAlias}.name`,
          `card.${cardAlias}.number`,
          `card.${cardAlias}.cvc`,
          `card.${cardAlias}.expiration`,
          `card.${cardAlias}.billing_address.zip`,
          `card.${cardAlias}.billing_address.country`,
        ],
        reason: 'E2E Form Basic test',
      },
      headers: {
        'X-Footprint-Secret-Key':
          api == 'dev' ? API_SECRET_KEY_DEV : API_SECRET_KEY_PROD,
      },
    },
  );
  const decryptedData = await response.json();
  expect(decryptedData).toEqual({
    [`card.${cardAlias}.name`]: data.name,
    [`card.${cardAlias}.number`]: data.number,
    [`card.${cardAlias}.expiration`]: data.expiration,
    [`card.${cardAlias}.cvc`]: data.cvc,
    [`card.${cardAlias}.billing_address.country`]: data.country,
    [`card.${cardAlias}.billing_address.zip`]: data.zip,
  });
};

export const saveFormViaRef = async ({ page }: { page: Page }) => {
  const requestPromise = page.waitForRequest('**/users/vault');
  await clickOn(/custom save via ref/i, page);

  const req = await requestPromise;
  const res = await req.response();
  expect(res?.status()).toBe(200);
};

export const saveForm = async ({
  frame,
  page,
}: {
  frame: FrameLocator;
  page: Page;
}) => {
  const requestPromise = page.waitForRequest('**/users/vault');
  await clickOnSave(frame);
  const req = await requestPromise;
  const res = await req.response();
  expect(res?.status()).toBe(200);
};

export const initializeForm = async ({
  flowId,
  page,
  fpUserId,
}: {
  fpUserId: string;
  flowId: string;
  page: Page;
}) => {
  const userIdField = page.getByLabel(/footprint user id/i).first();
  await userIdField.clear();
  await userIdField.fill(fpUserId);

  await page
    .getByLabel(/api secret key/i)
    .first()
    .fill(API_SECRET_KEY_DEV);
  await page
    .getByLabel(/card alias/i)
    .first()
    .fill(flowId);

  await page.getByLabel('Name').first().click();
  await page.getByLabel('Partial address').first().click();

  await clickOnContinue(page);
};
