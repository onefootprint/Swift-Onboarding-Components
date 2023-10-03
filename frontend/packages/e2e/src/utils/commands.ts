import type { Browser, FrameLocator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import path from 'path';

import readQrCode from './qr-code';

type WithFrame = { frame: FrameLocator | Page };
type WithPage = { page: Page };
type Outcome = 'Success' | 'Manual Review' | 'Fail';

export const selectOutcomeOptional = async (
  { frame }: WithFrame,
  outcome: Outcome,
) => {
  const outcomeCTA = frame.getByRole('button', { name: outcome }).first();
  return outcomeCTA
    .waitFor({ state: 'attached', timeout: 10000 })
    .then(() => outcomeCTA.click())
    .then(() => true)
    .catch(() => false);
};

export const clickOnContinue = async ({ frame }: WithFrame) => {
  const btn = frame
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .first();
  return btn
    .waitFor({ state: 'attached', timeout: 3000 })
    .then(() => btn.click())
    .then(() => true)
    .catch(() => false);
};

export const fillEmail = async (
  { frame }: WithFrame,
  payload: { email: string },
) => {
  const email = frame.getByLabel('Email').first();
  return email
    .waitFor({ state: 'attached', timeout: 2000 })
    .then(() => email.type(payload.email, { delay: 100 }))
    .then(() => true)
    .catch(() => false);
};

export const fillPhoneNumber = async (
  { frame }: WithFrame,
  payload: { phoneNumber: string },
) => {
  const phone = frame.getByLabel('Phone number').first();
  return phone
    .waitFor({ state: 'attached', timeout: 2000 })
    .then(() => phone.type(payload.phoneNumber, { delay: 100 }))
    .then(() => true)
    .catch(() => false);
};

export const verifyPhoneNumber = async ({
  frame,
  page,
}: WithFrame & WithPage) => {
  await expect(frame.getByText('Verify your phone number')).toBeAttached();

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(3000); // 3 seconds, receiving the SMS

  await frame.locator('input[type="tel"]').first().focus();
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');

  await expect(frame.getByText('Success!')).toBeAttached();
};

export const fillBasicData = async (
  { frame }: WithFrame,
  payload: { firstName: string; lastName: string; dob: string },
) => {
  await expect(frame.getByText('Basic data').first()).toBeAttached();
  await frame
    .getByLabel('First name')
    .first()
    .type(payload.firstName, { delay: 100 });
  await frame
    .getByLabel('Last name')
    .first()
    .type(payload.lastName, { delay: 100 });
  await frame
    .getByLabel('Date of Birth')
    .first()
    .type(payload.dob, { delay: 100 });
};

export const fillBasicDataKYB = async (
  { frame }: WithFrame,
  payload: {
    businessName: string;
    businessNameOptional: string;
    userTIN: string;
  },
) => {
  await expect(frame.getByText('Basic data').first()).toBeAttached();
  await frame
    .getByLabel('Business name')
    .first()
    .type(payload.businessName, { delay: 100 });
  await frame
    .getByLabel('Doing Business As (optional)')
    .first()
    .type(payload.businessNameOptional, { delay: 100 });
  await frame
    .getByLabel('Taxpayer Identification Number (TIN)')
    .first()
    .type(payload.userTIN, { delay: 100 });
};

export const fillAddress = async (
  { frame, page }: { frame: FrameLocator; page: Page },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  const title = frame.getByText("What's your residential address?").first();
  await title.waitFor({ state: 'attached', timeout: 10000 }).catch(() => false);

  await frame
    .getByLabel('Address line 1')
    .first()
    .type(payload.addressLine1, { delay: 100 });
  await frame.getByLabel('City').first().type(payload.city, { delay: 100 });
  await frame
    .getByLabel('Zip code')
    .first()
    .type(payload.zipCode, { delay: 100 });
  await frame
    .getByRole('button', { name: 'State', disabled: false }) // For KYC is "State"
    .first()
    .click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
};

export const fillAddressKYB = async (
  { frame, page }: { frame: FrameLocator; page: Page },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  const title = frame
    .getByText("What's your registered business address?")
    .first();
  await title.waitFor({ state: 'attached', timeout: 10000 }).catch(() => false);

  await frame
    .getByLabel('Address line 1')
    .first()
    .type(payload.addressLine1, { delay: 100 });
  await frame.getByLabel('City').first().type(payload.city, { delay: 100 });
  await frame
    .getByLabel('Zip code')
    .first()
    .type(payload.zipCode, { delay: 100 });
  await frame
    .getByRole('button', { name: 'Select', disabled: false }) // For KYB is "Select"
    .first()
    .click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
};

export const fillBeneficialOwners = async (
  { frame }: { frame: FrameLocator },
  payload: {
    beneficialOwner1Email: string;
    beneficialOwner1LastName: string;
    beneficialOwner1Name: string;
    beneficialOwner1Phone: string;
    userFirstName: string;
    userLastName: string;
  },
) => {
  const header = frame.getByText('Who are the beneficial owners?').first();
  await header
    .waitFor({ state: 'attached', timeout: 10000 })
    .catch(() => false);

  await frame
    .locator('input[name="beneficialOwners.0.first_name"]')
    .first()
    .type(payload.userFirstName, { delay: 100 });
  await frame
    .locator('input[name="beneficialOwners.0.last_name"]')
    .first()
    .type(payload.userLastName, { delay: 100 });
  const share0 = frame
    .locator('input[name="beneficialOwners.0.ownership_stake"]')
    .first();
  await share0.clear();
  await share0.type('50', { delay: 100 });

  await frame.getByRole('button', { name: 'Add more' }).first().click();

  await frame
    .locator('input[name="beneficialOwners.1.first_name"]')
    .first()
    .type(payload.beneficialOwner1Name, { delay: 100 });
  await frame
    .locator('input[name="beneficialOwners.1.last_name"]')
    .first()
    .type(payload.beneficialOwner1LastName, { delay: 100 });
  await frame
    .locator('input[name="beneficialOwners.1.email"]')
    .first()
    .type(payload.beneficialOwner1Email, { delay: 100 });
  await frame
    .locator('input[name="beneficialOwners.1.phone_number"]')
    .first()
    .type(payload.beneficialOwner1Phone, { delay: 100 });
  const share1 = frame
    .locator('input[name="beneficialOwners.1.ownership_stake"]')
    .first();
  await share1.clear();
  await share1.type('50', { delay: 100 });
};

export const fillSSN = async (
  { frame }: WithFrame,
  payload: { ssn: string },
) => {
  await expect(
    frame.getByText("What's your Social Security Number?").first(),
  ).toBeAttached();
  await frame.getByLabel('SSN').type(payload.ssn, { delay: 100 });
  await clickOnContinue({ frame });
};

export const confirmData = async (
  { frame }: WithFrame,
  payload: {
    firstName: string;
    lastName: string;
    dob: string;
    addressLine1: string;
    city: string;
    zipCode: string;
  },
) => {
  const header = frame
    .getByRole('heading')
    .filter({ hasText: /Confirm/i })
    .first();
  await header
    .waitFor({ state: 'attached', timeout: 10000 })
    .catch(() => false); // Increasing the waiting time for CI

  await expect(frame.getByText(payload.firstName).first()).toBeAttached();
  await expect(frame.getByText(payload.lastName).first()).toBeAttached();
  await expect(frame.getByText(payload.dob).first()).toBeAttached();
  await expect(frame.getByText(payload.addressLine1).first()).toBeAttached();
  await expect(frame.getByText(payload.city).first()).toBeAttached();
  await expect(frame.getByText(payload.zipCode).first()).toBeAttached();
};

export const doLivenessCheck = async (
  {
    frame,
    page,
    browser,
  }: { frame: FrameLocator; page: Page; browser: Browser },
  { flowId }: { flowId: string },
) => {
  const header = frame.getByText('Liveness check').first();
  await header
    .waitFor({ state: 'attached', timeout: 10000 })
    .catch(() => false); // Increasing the waiting time for CI

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(4000); // We need to give a moment for the QR code to be generated

  await frame
    .locator('#idv-body-content-container svg')
    .first()
    .screenshot({ path: `./src/media/qr-${flowId}.png` });

  const screenshotPath = path.join(__dirname, `../media/qr-${flowId}.png`);
  const qrCodeUrl = await readQrCode(screenshotPath).catch(
    () => 'Error reading QR code',
  );

  if (qrCodeUrl === 'Error reading QR code' || !qrCodeUrl.includes('http')) {
    console.warn('Error reading QR code');
    return frame
      .getByRole('button')
      .filter({ hasText: /Continue on desktop/i })
      .click();
  }

  const popup = await browser.newPage();
  await popup.goto(qrCodeUrl);
  await popup.waitForLoadState();

  const testOutcomeH2 = popup.getByText('Test outcomes').first();
  await testOutcomeH2
    .waitFor({ state: 'attached', timeout: 3000 })
    .catch(() => false);

  await selectOutcomeOptional({ frame: popup }, 'Success');
  await clickOnContinue({ frame: popup });

  const popupHeader = popup
    .getByText('Please continue on your computer.')
    .first();
  await popupHeader
    .waitFor({ state: 'attached', timeout: 1000 })
    .catch(() => false); // Increasing the waiting time for CI
};
