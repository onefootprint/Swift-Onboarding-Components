import type { Browser, FrameLocator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import path from 'path';

import readQrCode from './qr-code';

type WithFrame = { frame: FrameLocator };
type WithPage = { page: Page };
type Outcome = 'Success' | 'Manual Review' | 'Fail';

export const selectOutcome = async ({ frame }: WithFrame, outcome: Outcome) => {
  const outcomeCTA = frame.getByRole('button', { name: outcome }).first();
  await outcomeCTA.waitFor({ state: 'attached', timeout: 20000 });
  return outcomeCTA.click();
};

export const clickOnContinue = async ({ frame }: WithFrame) => {
  return frame
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .click();
};

export const fillEmail = async (
  { frame }: WithFrame,
  payload: { email: string },
) => {
  await frame.getByLabel('Email').type(payload.email, { delay: 100 });
};

export const fillPhoneNumber = async (
  { frame }: WithFrame,
  payload: { phoneNumber: string },
) => {
  await frame
    .getByLabel('Phone number')
    .type(payload.phoneNumber, { delay: 100 });
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
  await frame.getByLabel('First name').type(payload.firstName, { delay: 100 });
  await frame.getByLabel('Last name').type(payload.lastName, { delay: 100 });
  await frame.getByLabel('Date of Birth').type(payload.dob, { delay: 100 });
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
    .type(payload.businessName, { delay: 100 });
  await frame
    .getByLabel('Doing Business As (optional)')
    .type(payload.businessNameOptional, { delay: 100 });
  await frame
    .getByLabel('Taxpayer Identification Number (TIN)')
    .type(payload.userTIN, { delay: 100 });
};

export const fillAddress = async (
  { frame, page }: { frame: FrameLocator; page: Page },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  const title = frame.getByText("What's your residential address?").first();
  await title.waitFor({ state: 'attached', timeout: 20000 });

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
  await title.waitFor({ state: 'attached', timeout: 20000 });

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
  await header.waitFor({ state: 'attached', timeout: 20000 });

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
  const header = frame.getByText('Confirm your personal data').first();
  await header.waitFor({ state: 'attached', timeout: 20000 }); // Increasing the waiting time for CI

  await expect(
    frame.getByText('Confirm your personal data').first(),
  ).toBeAttached();
  await expect(frame.getByText(payload.firstName)).toBeAttached();
  await expect(frame.getByText(payload.lastName)).toBeAttached();
  await expect(frame.getByText(payload.dob)).toBeAttached();
  await expect(frame.getByText(payload.addressLine1)).toBeAttached();
  await expect(frame.getByText(payload.city)).toBeAttached();
  await expect(frame.getByText(payload.zipCode)).toBeAttached();
};

export const doLivenessCheck = async (
  {
    frame,
    page,
    browser,
  }: { frame: FrameLocator; page: Page; browser: Browser },
  { flowId }: { flowId: string },
) => {
  await expect(frame.getByText('Liveness check')).toBeAttached();
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(2000); // We need to give a moment for the QR code to be generated
  await frame
    .locator('#idv-body-content-container svg')
    .first()
    .screenshot({ path: `./src/media/qr-${flowId}.png` });

  const screenshotPath = path.join(__dirname, `../media/qr-${flowId}.png`);
  expect(screenshotPath).toBeDefined();

  const qrCodeUrl = await readQrCode(screenshotPath);
  expect(qrCodeUrl).toBeDefined();

  const popup = await browser.newPage();
  await popup.goto(qrCodeUrl);
  await popup.waitForLoadState();
  await expect(
    popup.getByText('Please continue on your computer.'),
  ).toBeAttached();
};

export const authorizeAccess = async ({ frame }: WithFrame) => {
  await expect(frame.getByText('Authorize access')).toBeAttached();
  await frame.getByRole('button', { name: /Authorize/i }).click();
};
