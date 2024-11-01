import { expect, test } from '@playwright/test';

import {
  clickOnContinue,
  clickOnVerifyWithSms,
  fillNameAndDoB,
  fillPhoneNumber,
  selectOutcomeOptional,
  verifyAppIframeClick,
  verifyPhoneNumber,
} from '../utils/commands';

const appUrl = process.env.E2E_BIFROST_BASE_URL || 'http://localhost:3000';
const key = process.env.E2E_OB_KYC_NON_US || 'pb_test_N1PvhexakRkydx2t9dTl1m';
const locale = 'es-MX';

const firstName = 'Jorge';
const lastName = 'Mejia';
const dob = '25/12/1990';
const email = 'jorge@mejia.com';
const phoneNumber = '5555550100';

const userData = encodeURIComponent(JSON.stringify({ 'id.email': email }));

test.beforeEach(async ({ browserName, isMobile, page }) => {
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

  await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
  await page.goto(
    `/components/verify?ob_key=${key}&locale=${locale}&app_url=${appUrl}&bootstrap_data=${userData}&f=${flowId}`,
  );
  await page.waitForLoadState();

  await verifyAppIframeClick(page, isMobile);
  await page.waitForLoadState();
});

test('E2E.es-MX.KYC.Docs #ci', async ({ isMobile, page }) => {
  test.slow();
  test.skip(isMobile, 'Mobile <Select /> bug'); // eslint-disable-line playwright/no-skipped-test
  const timeout = isMobile ? 40000 : 20000; // eslint-disable-line playwright/no-conditional-in-test

  const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');
  await expect(frame.getByText(/Sandbox Mode/i)).toBeVisible({ timeout });

  await selectOutcomeOptional(frame, 'Success');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame.getByRole('button').filter({ hasText: '+52' }).first().click();
  await page.keyboard.press('u');
  await page.keyboard.press('n');
  await page.keyboard.press('i');
  await page.keyboard.press('t');
  await page.keyboard.press('Enter');

  await fillPhoneNumber(frame, phoneNumber);
  await clickOnVerifyWithSms(frame);
  await page.waitForLoadState();

  await verifyPhoneNumber({ frame, page });
  await page.waitForLoadState();

  await fillNameAndDoB(frame, { firstName, lastName, dob });
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await frame.getByRole('button').filter({ hasText: 'Taiwan' }).first().click();
  await page.keyboard.press('m');
  await page.keyboard.press('e');
  await page.keyboard.press('x');
  await page.keyboard.press('i');
  await page.keyboard.press('Enter');

  await frame.getByLabel('Address').first().fill('Av. Paseo de la Reforma 123');
  await frame.getByLabel('Apartment/neighborhood (optional)').first().fill('Colonia Juárez');
  await frame.getByLabel('City').first().fill('Cuidad de México');
  await frame.getByLabel('Zip code').first().fill('06600');
  await clickOnContinue(frame);
  await page.waitForLoadState();

  await expect(frame.getByText(firstName).first()).toBeAttached();
  await expect(frame.getByText(lastName).first()).toBeAttached();
  await expect(frame.getByText(dob).first()).toBeAttached();
  await expect(frame.getByText('Av. Paseo de la Reforma 123, Colonia Juárez').first()).toBeAttached();
  await expect(frame.getByText('Cuidad de México, 06600, MX').first()).toBeAttached();
});
