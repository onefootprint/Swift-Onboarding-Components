import type { Browser, FrameLocator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import path from 'path';

import readQrCode from './qr-code';

export const selectOutcome = async (
  {
    frame,
  }: {
    frame: FrameLocator;
  },
  outcome: 'Success' | 'Manual Review' | 'Fail',
) => {
  return frame.getByRole('button', { name: outcome }).first().click();
};

export const clickOnContinue = async ({ frame }: { frame: FrameLocator }) => {
  return frame
    .getByRole('button')
    .filter({ hasText: /continue/i })
    .click();
};

export const fillEmail = async (
  {
    frame,
  }: {
    frame: FrameLocator;
  },
  payload: { email: string },
) => {
  await frame.getByLabel('Email').type(payload.email, { delay: 100 });
};

export const fillPhoneNumber = async (
  {
    frame,
  }: {
    frame: FrameLocator;
  },
  payload: { phoneNumber: string },
) => {
  await frame
    .getByLabel('Phone number')
    .type(payload.phoneNumber, { delay: 100 });
};

export const verifyPhoneNumber = async ({
  frame,
  page,
}: {
  frame: FrameLocator;
  page: Page;
}) => {
  await expect(frame.getByText('Verify your phone number')).toBeAttached();

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
  {
    frame,
  }: {
    frame: FrameLocator;
  },
  payload: { firstName: string; lastName: string; dob: string },
) => {
  await expect(frame.getByText('Basic data').first()).toBeAttached();
  await frame.getByLabel('First name').type(payload.firstName, { delay: 100 });
  await frame.getByLabel('Last name').type(payload.lastName, { delay: 100 });
  await frame.getByLabel('Date of Birth').type(payload.dob, { delay: 100 });
};

export const fillAddress = async (
  {
    frame,
    page,
  }: {
    frame: FrameLocator;
    page: Page;
  },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  await expect(
    frame.getByText("What's your residential address?"),
  ).toBeAttached();

  await frame
    .getByLabel('Address line 1')
    .type(payload.addressLine1, { delay: 100 });
  await frame.getByLabel('City').type(payload.city, { delay: 100 });
  await frame.getByLabel('Zip code').type(payload.zipCode, { delay: 100 });
  await frame.getByRole('button', { name: 'Select' }).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
};

export const fillSSN = async (
  {
    frame,
  }: {
    frame: FrameLocator;
  },
  payload: { ssn: string },
) => {
  await expect(
    frame.getByText("What's your Social Security Number?").first(),
  ).toBeAttached();
  await frame.getByLabel('SSN').type(payload.ssn, { delay: 100 });
  await clickOnContinue({ frame });
};

export const confirmData = async (
  {
    frame,
  }: {
    frame: FrameLocator;
  },
  payload: {
    firstName: string;
    lastName: string;
    dob: string;
    addressLine1: string;
    city: string;
    zipCode: string;
  },
) => {
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
  }: {
    frame: FrameLocator;
    page: Page;
    browser: Browser;
  },
  { flowId }: { flowId: string },
) => {
  await expect(frame.getByText('Liveness check')).toBeAttached();
  await page.waitForTimeout(2000);
  await frame
    .locator('form svg')
    .first()
    .screenshot({ path: `./src/media/qr-${flowId}.png` });

  const screenshotPath = path.join(__dirname, `../media/qr-${flowId}.png`);
  const qrCodeUrl = await readQrCode(screenshotPath);
  const popup = await browser.newPage();
  await popup.goto(qrCodeUrl);
  await popup.waitForLoadState();
  await expect(
    popup.getByText('Please continue on your computer.'),
  ).toBeAttached();
};

export const authorizeAccess = async ({ frame }: { frame: FrameLocator }) => {
  await expect(frame.getByText('Authorize access')).toBeAttached();
  await frame.getByRole('button', { name: /Authorize/i }).click();
};
