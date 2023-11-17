import type { Browser, FrameLocator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import path from 'path';

import readQrCode from './qr-code';

type WithFrame = { frame: FrameLocator | Page };
type WithPage = { page: Page };
type PageNFrame = WithFrame & WithPage;
type Outcome = 'Success' | 'Manual Review' | 'Fail';

const attachedState = { state: 'attached' as const, timeout: 2000 };

const clickOn = async (
  hasText: RegExp,
  { frame }: WithFrame,
): Promise<boolean> => {
  const btn = frame.getByRole('button').filter({ hasText }).first();
  try {
    await btn.waitFor(attachedState);
    await btn.click();
    return true;
  } catch {
    return false;
  }
};

export const clickOnContinue = clickOn.bind(null, /continue/i);
export const continueOnAgree = clickOn.bind(null, /agree/i);
export const continueOnDesktop = clickOn.bind(null, /continue on desktop/i);
export const continueOnTakePhoto = clickOn.bind(null, /take photo/i);
export const continueOnConfirm = clickOn.bind(null, /confirm/i);

export const selectOutcomeOptional = async (
  { frame }: WithFrame,
  outcome: Outcome,
) => {
  const selectFirstOption = frame
    .getByRole('button', { name: 'Success' })
    .first();

  await selectFirstOption
    .waitFor({ state: 'attached', timeout: 15000 })
    .then(() => selectFirstOption.click())
    .then(() => true)
    .catch(() => false);

  const outcomeBtn = frame.getByRole('button', { name: outcome }).first();
  return outcomeBtn
    .waitFor({ state: 'attached', timeout: 15000 })
    .then(() => outcomeBtn.click())
    .then(() => true)
    .catch(() => false);
};

export const waitForVerifyButton = async ({ page }: WithPage) => {
  const btn = page.locator('.footprint-verify-button').first();
  await btn
    .waitFor({ state: 'attached', timeout: 20000 })
    .then(() => true)
    .catch(() => false);
};

export const uploadImage = async (
  { frame, page, isMobile }: PageNFrame & { isMobile: boolean },
  cta: RegExp,
  fileName: string,
) => {
  const filePath = path.join(__dirname, `../upload/${fileName}`);
  const fileChooserPromise = page.waitForEvent('filechooser');
  if (isMobile) {
    await frame.locator('button[radius="56"]').first().click();
  } else {
    await frame.getByText(cta).first().click();
  }
  const fileDriverFrontBlurredChooser = await fileChooserPromise;

  return fileDriverFrontBlurredChooser.setFiles(filePath);
};

export const fillEmail = async (
  { frame }: WithFrame,
  payload: { email: string },
) => {
  const field = frame.getByLabel('Email').first();
  return field
    .waitFor(attachedState)
    .then(() => field.fill(payload.email))
    .then(() => true)
    .catch(() => false);
};

export const fillPhoneNumber = async (
  { frame }: WithFrame,
  payload: { phoneNumber: string },
) => {
  const field = frame.getByLabel('Phone number').first();
  return field
    .waitFor(attachedState)
    .then(() => field.type(payload.phoneNumber, { delay: 100 }))
    .then(() => true)
    .catch(() => false);
};

export const sixDigitChallenger = async (
  header: string,
  { frame, page }: PageNFrame,
) => {
  await expect(frame.getByText(header)).toBeAttached();

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(3000); // 3 seconds, receiving the SMS

  await frame.locator('input[type="tel"]').first().focus();
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
  await page.keyboard.press('0');
};

export const verifyEmail = sixDigitChallenger.bind(null, 'Verify your email');
export const verifyPhoneNumber = sixDigitChallenger.bind(
  null,
  'Verify your phone number',
);

export const fillNameAndDoB = async (
  { frame }: WithFrame,
  payload: { firstName: string; lastName: string; dob: string },
) => {
  await frame.getByLabel('First name').first().fill(payload.firstName);
  await frame.getByLabel('Last name').first().fill(payload.lastName);
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
  await frame.getByLabel('Business name').first().fill(payload.businessName);
  await frame
    .getByLabel('Doing Business As (optional)')
    .first()
    .fill(payload.businessNameOptional);
  await frame
    .getByLabel('Taxpayer Identification Number (TIN)')
    .first()
    .type(payload.userTIN, { delay: 100 });
};

export const fillAddress = async (
  { frame, page }: { frame: FrameLocator; page: Page },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  await frame.getByLabel('Address line 1').first().fill(payload.addressLine1);
  await frame.getByLabel('City').first().fill(payload.city);
  await frame.getByLabel('Zip code').first().fill(payload.zipCode);
  await frame
    .getByRole('button', { name: 'State', disabled: false, exact: true })
    .first()
    .click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
};

export const fillAddressKYB = async (
  { frame, page }: { frame: FrameLocator; page: Page },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  await frame.getByLabel('Address line 1').first().fill(payload.addressLine1);
  await frame.getByLabel('City').first().fill(payload.city);
  await frame.getByLabel('Zip code').first().fill(payload.zipCode);
  await frame
    .getByRole('button', { name: 'Select', disabled: false })
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
  await frame
    .locator('input[name="beneficialOwners.0.first_name"]')
    .first()
    .fill(payload.userFirstName);
  await frame
    .locator('input[name="beneficialOwners.0.last_name"]')
    .first()
    .fill(payload.userLastName);
  const share0 = frame
    .locator('input[name="beneficialOwners.0.ownership_stake"]')
    .first();
  await share0.clear();
  await share0.type('50', { delay: 100 });

  await frame.getByRole('button', { name: 'Add more' }).first().click();

  await frame
    .locator('input[name="beneficialOwners.1.first_name"]')
    .first()
    .fill(payload.beneficialOwner1Name);
  await frame
    .locator('input[name="beneficialOwners.1.last_name"]')
    .first()
    .fill(payload.beneficialOwner1LastName);
  await frame
    .locator('input[name="beneficialOwners.1.email"]')
    .first()
    .fill(payload.beneficialOwner1Email);
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
  await frame.getByLabel('SSN').first().type(payload.ssn, { delay: 100 });
};

export const confirmData = async (
  { frame }: WithFrame,
  payload: {
    firstName: string;
    lastName: string;
    dob: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    ssn?: string;
  },
) => {
  await expect(frame.getByText(payload.firstName).first()).toBeAttached();
  await expect(frame.getByText(payload.lastName).first()).toBeAttached();
  await expect(frame.getByText(payload.dob).first()).toBeAttached();
  await expect(frame.getByText(payload.addressLine1).first()).toBeAttached();
  if (payload.addressLine2) {
    await expect(frame.getByText(payload.addressLine2).first()).toBeAttached();
  }
  await expect(frame.getByText(payload.city).first()).toBeAttached();
  await expect(frame.getByText(payload.state).first()).toBeAttached();
  await expect(frame.getByText(payload.zipCode).first()).toBeAttached();
  await expect(frame.getByText(payload.country).first()).toBeAttached();
  if (payload.ssn) {
    // SSN value should be scrubbed by default
    await expect(
      frame.getByText('•'.repeat(payload.ssn.length)).first(),
    ).toBeAttached();
  }
};

export const doLivenessCheck = async (
  {
    frame,
    page,
    browser,
  }: { frame: FrameLocator; page: Page; browser: Browser },
  { flowId }: { flowId: string },
) => {
  const header = frame.getByText(/liveness check/i).first();
  const hasHeader = await header
    .waitFor({ state: 'attached', timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!hasHeader) return;

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(4000); // We need to give a moment for the QR code to be generated

  await frame
    .locator('p + svg')
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
