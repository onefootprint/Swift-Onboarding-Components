import { expect, test } from '@playwright/test';

import { clickOn } from '../verify/utils/commands';
import {
  createUser,
  decryptData,
  fillCardData,
  findMissingConfig,
  initializeForm,
  saveFormViaRef,
  waitForFormLoad,
} from './utils/commands';

const formAppUrl =
  (process.env.E2E_COMPONENTS_BASE_URL || 'http://localhost:3010') + '/form';

const name = 'Piip Penguin';
const number = '378282246310005';
const cvc = '1234';
const zip = '12345';
const missingConfig = findMissingConfig();

test.describe('/components/form', () => {
  test('form.errors #ci', async ({ browserName, isMobile, page, request }) => {
    expect(missingConfig, missingConfig?.message).toBe(undefined);

    test.setTimeout(120000);
    test.skip(isMobile, 'skip test for mobile'); // eslint-disable-line playwright/no-skipped-test

    const fpUserId = await createUser({ request });
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await page.goto(`/components/form?app_url=${formAppUrl}&f=${flowId}`);
    await page.waitForLoadState();

    await initializeForm({ page, fpUserId, flowId });
    const frame = await waitForFormLoad(page);

    // If the form is not filled, user shouldn't be able to save it
    await clickOn(/custom save via ref/i, page);
    const errorToastTitle = page.getByText('Error').first();
    await errorToastTitle.waitFor({ state: 'attached', timeout: 1000 });
    const errorToastDescription = page
      .getByText('Please fix the inputs and try again.')
      .first();
    await errorToastDescription.waitFor({ state: 'attached', timeout: 1000 });

    const nameEmpty = frame.getByText('Name cannot be empty').first();
    await nameEmpty.waitFor({ state: 'attached', timeout: 2000 });
    const numberEmpty = frame.getByText('Card number cannot be empty').first();
    await numberEmpty.waitFor({ state: 'attached', timeout: 2000 });
    const expiryEmpty = frame.getByText('Expiry date cannot be empty').first();
    await expiryEmpty.waitFor({ state: 'attached', timeout: 2000 });
    const cvcEmpty = frame.getByText('CVC cannot be empty').first();
    await cvcEmpty.waitFor({ state: 'attached', timeout: 2000 });
    const zipEmptyOrInvalid = frame
      .getByText('Zip code cannot be empty or is invalid')
      .first();
    await zipEmptyOrInvalid.waitFor({ state: 'attached', timeout: 2000 });

    // Fill the form with invalid data and try to save it
    await fillCardData({
      frame,
      data: {
        name,
        number: '123',
        cvc: '1',
        expiration: '09/99',
        zip: '12',
        country: 'US',
      },
    });
    await clickOn(/custom save via ref/i, page);

    // Filling the name should remove the previous error
    const isNameEmptyVisible = await nameEmpty.isVisible();
    expect(isNameEmptyVisible).toBe(false);
    const isNumberEmptyVisible = await numberEmpty.isVisible();
    expect(isNumberEmptyVisible).toBe(false);
    const isExpiryEmptyVisible = await expiryEmpty.isVisible();
    expect(isExpiryEmptyVisible).toBe(false);
    const isCvcEmptyVisible = await cvcEmpty.isVisible();
    expect(isCvcEmptyVisible).toBe(false);
    const isZipEmptyVisible = await zipEmptyOrInvalid.isVisible();
    expect(isZipEmptyVisible).toBe(true);

    const numberInvalid = frame.getByText('Invalid card number').first();
    await numberInvalid.waitFor({ state: 'attached', timeout: 1000 });
    const expiryInvalid = frame
      .getByText('Date must be valid and in the future')
      .first();
    await expiryInvalid.waitFor({ state: 'attached', timeout: 1000 });
    const cvcInvalid = frame.getByText('Invalid CVC').first();
    await cvcInvalid.waitFor({ state: 'attached', timeout: 1000 });
    const zipInvalid = frame
      .getByText('Zip code cannot be empty or is invalid')
      .first();
    await zipInvalid.waitFor({ state: 'attached', timeout: 1000 });

    // Fix the inputs and save again
    await fillCardData({
      frame,
      data: {
        name,
        number,
        cvc,
        expiration: '12/35',
        zip,
        country: 'US',
      },
    });

    await saveFormViaRef({ page });

    const isNumberInvalidVisible = await numberInvalid.isVisible();
    expect(isNumberInvalidVisible).toBe(false);
    const isExpiryInvalidVisible = await expiryInvalid.isVisible();
    expect(isExpiryInvalidVisible).toBe(false);
    const isCvcInvalidVisible = await cvcInvalid.isVisible();
    expect(isCvcInvalidVisible).toBe(false);
    const isZipInvalidVisible = await zipInvalid.isVisible();
    expect(isZipInvalidVisible).toBe(false);

    const refSuccessToast = page
      .getByText('Successfully saved via ref')
      .first();
    await refSuccessToast.waitFor({ state: 'attached', timeout: 6000 });
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
});
