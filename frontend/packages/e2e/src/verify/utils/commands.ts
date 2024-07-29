import path from 'path';
import type { Browser, FrameLocator, Page } from '@playwright/test';
import { devices, expect } from '@playwright/test';

type WithFrame = { frame: FrameLocator | Page };
type WithPage = { page: Page };
type PageNFrame = WithFrame & WithPage;
type Outcome = 'Success' | 'Manual Review' | 'Fail';

// const handoffBaseUrl = process.env.E2E_HANDOFF_BASE_URL || 'http://localhost:3005';
const attachedState = { state: 'attached' as const, timeout: 4000 };

export const clickOn = async (hasText: RegExp, parent: FrameLocator | Page) => {
  const btn = parent.getByRole('button').filter({ hasText }).first();
  try {
    await btn.waitFor(attachedState);
    await btn.click();
    return true;
  } catch {
    throw new Error(`Could not find button with text ${hasText}`);
  }
};

export const clickOnContinue = clickOn.bind(null, /continue/i);
export const clickOnVerifyWithSms = clickOn.bind(null, /verify with sms/i);
export const clickOnSave = clickOn.bind(null, /save/i);
export const clickOnAgree = clickOn.bind(null, /agree/i);
export const clickOnTakePhoto = clickOn.bind(null, /take photo/i);
export const clickOnConfirm = clickOn.bind(null, /confirm/i);
export const clickOnCancel = clickOn.bind(null, /cancel/i);
export const clickOnYes = clickOn.bind(null, /yes/i);

export const softCheckSupport = async (frame: FrameLocator) => {
  const btn = frame.getByRole('button', { name: 'Support' }).first();
  return btn
    .waitFor({ state: 'attached', timeout: 15000 })
    .then(() => true)
    .catch(() => false);
};

export const selectOutcomeOptional = async (parent: FrameLocator | Page, outcome: Outcome) => {
  const successOption = parent.getByRole('button', { name: 'Success' }).first();
  await successOption.waitFor({ state: 'attached', timeout: 15000 }).then(() => successOption.click());

  const outcomeBtn = parent.getByRole('button', { name: outcome }).first();
  return outcomeBtn.waitFor({ state: 'attached', timeout: 15000 }).then(() => outcomeBtn.click());
};

/** @deprecated: Please use `verifyAppIframeClick()` with /components/verify route instead.  */
export const waitForVerifyButton = async (page: Page) => {
  const btn = page.locator('.footprint-verify-button').first();
  await btn.waitFor({ state: 'attached', timeout: 20000 });
};

export const uploadImage = async (
  { frame, page, isMobile }: PageNFrame & { isMobile: boolean },
  cta: RegExp,
  fileName: string,
) => {
  const filePath = path.join(__dirname, `../../upload/${fileName}`);
  const fileChooserPromise = page.waitForEvent('filechooser');
  if (isMobile) {
    await frame.locator('button[radius="56"]').first().click();
  } else {
    await frame.getByText(cta).first().click();
  }
  const fileDriverFrontBlurredChooser = await fileChooserPromise;

  return fileDriverFrontBlurredChooser.setFiles(filePath);
};

export const fillEmail = async (parent: FrameLocator | Page, str: string) => {
  const input = parent.getByLabel(/email/i).first();
  return input.waitFor(attachedState).then(() => input.fill(str));
};

export const fillPhoneNumber = async (parent: FrameLocator | Page, str: string) => {
  const input = parent.locator('input[name="phoneNumber"]').first();
  return input /** locator.fill() needs a visible input, bypass using force:true */
    .waitFor(attachedState)
    .then(() => input.fill(str, { force: true })); // eslint-disable-line playwright/no-force-option,
};

export const sixDigitChallenger = async (header: string, { frame, page }: PageNFrame) => {
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
export const verifyPhoneNumber = sixDigitChallenger.bind(null, 'Verify your phone number');

export const fillNameAndDoB = async (
  frame: FrameLocator,
  payload: { firstName: string; lastName: string; dob: string },
) => {
  await frame.getByLabel('First name').first().fill(payload.firstName);
  await frame.getByLabel('Last name').first().fill(payload.lastName);
  await frame.getByLabel('Date of Birth').first().fill(payload.dob);
};

export const fillBasicDataKYB = async (
  frame: FrameLocator,
  payload: {
    businessName: string;
    businessNameOptional: string;
    userTIN: string;
  },
) => {
  await frame.getByLabel('Business name').first().fill(payload.businessName);
  await frame.getByLabel('Doing Business As (optional)').first().fill(payload.businessNameOptional);
  await frame.getByLabel('Taxpayer Identification Number (TIN)').first().fill(payload.userTIN);
};

export const fillAddress = async (
  { frame, page }: { frame: FrameLocator; page: Page },
  payload: { addressLine1: string; city: string; zipCode: string },
) => {
  await frame.getByLabel('Address line 1').first().fill(payload.addressLine1);
  await frame.getByLabel('City').first().fill(payload.city);
  await frame.getByLabel('Zip code').first().fill(payload.zipCode);
  await frame.getByRole('button', { name: 'State', disabled: false, exact: true }).first().click();
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
  await frame.getByRole('button', { name: 'Select', disabled: false }).first().click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
};

export const fillBeneficialOwners = async (
  frame: FrameLocator,
  payload: {
    beneficialOwner1Email: string;
    beneficialOwner1LastName: string;
    beneficialOwner1Name: string;
    beneficialOwner1Phone: string;
    userFirstName: string;
    userLastName: string;
  },
) => {
  await frame.locator('input[name="beneficialOwners.0.first_name"]').first().fill(payload.userFirstName);
  await frame.locator('input[name="beneficialOwners.0.last_name"]').first().fill(payload.userLastName);
  const share0 = frame.locator('input[name="beneficialOwners.0.ownership_stake"]').first();
  await share0.clear();
  await share0.fill('50');

  await frame.getByRole('button', { name: 'Add more' }).first().click();

  await frame.locator('input[name="beneficialOwners.1.first_name"]').first().fill(payload.beneficialOwner1Name);
  await frame.locator('input[name="beneficialOwners.1.last_name"]').first().fill(payload.beneficialOwner1LastName);
  await frame.locator('input[name="beneficialOwners.1.email"]').first().fill(payload.beneficialOwner1Email);
  await frame.locator('input[name="beneficialOwners.1.phone_number"]').first().fill(payload.beneficialOwner1Phone);
  const share1 = frame.locator('input[name="beneficialOwners.1.ownership_stake"]').first();
  await share1.clear();
  await share1.fill('50');
};

export const fillSSN = async (frame: FrameLocator, payload: { ssn: string }) => {
  const field = frame.getByLabel('SSN').first();
  await field.waitFor(attachedState).then(() => field.fill(payload.ssn));
};

export const fillTaxId = async (frame: FrameLocator, payload: { id: string }) => {
  const field = frame.getByLabel('Tax ID').first();
  await field.waitFor(attachedState).then(() => field.fill(payload.id));
};

export const fillVisa = async ({ frame, page }: PageNFrame) => {
  await frame.getByRole('radio', { name: 'I have a Visa', disabled: false }).first().click();

  const citizenships = frame
    .getByRole('button', {
      name: 'Select',
      disabled: false,
      exact: true,
    })
    .first();
  await citizenships.scrollIntoViewIfNeeded();
  await citizenships.click();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  const nationality = frame.getByRole('button', { name: 'Select', disabled: false, exact: true }).first();
  await nationality.scrollIntoViewIfNeeded();
  await nationality.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await frame
    .getByText(/continue/i)
    .first()
    .scrollIntoViewIfNeeded();

  const visaKind = frame.getByRole('button', { name: 'Select', disabled: false, exact: true }).first();
  await visaKind.scrollIntoViewIfNeeded();
  await visaKind.click();
  await frame.getByText('E-1').first().click();

  const field = frame.getByLabel('Visa expiration date').first();
  await field.waitFor(attachedState).then(() => field.fill('01/01/2024'));
};

export const confirmData = async (
  parent: FrameLocator | Page,
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
    citizenship?: string;
    nationality?: string;
    usLegalStatus?: string;
    visaKind?: string;
    visaExpirationDate?: string;
  },
) => {
  await expect(parent.getByText(payload.firstName).first()).toBeAttached();
  await expect(parent.getByText(payload.lastName).first()).toBeAttached();
  await expect(parent.getByText(payload.dob).first()).toBeAttached();
  await expect(parent.getByText(payload.addressLine1).first()).toBeAttached();
  if (payload.addressLine2) {
    await expect(parent.getByText(payload.addressLine2).first()).toBeAttached();
  }
  await expect(parent.getByText(payload.city).first()).toBeAttached();
  await expect(parent.getByText(payload.state).first()).toBeAttached();
  await expect(parent.getByText(payload.zipCode).first()).toBeAttached();
  await expect(parent.getByText(payload.country).first()).toBeAttached();
  if (payload.ssn) {
    // SSN value should be scrubbed by default
    await expect(parent.getByText('•'.repeat(payload.ssn.length)).first()).toBeAttached();
  }
  if (payload.citizenship) {
    await expect(parent.getByText(payload.citizenship).first()).toBeAttached();
  }
  if (payload.nationality) {
    await expect(parent.getByText(payload.nationality).first()).toBeAttached();
  }
  if (payload.usLegalStatus) {
    await expect(parent.getByText(payload.usLegalStatus).first()).toBeAttached();
  }
  if (payload.visaKind) {
    await expect(parent.getByText(payload.visaKind).first()).toBeAttached();
  }
  if (payload.visaExpirationDate) {
    await expect(parent.getByText(payload.visaExpirationDate).first()).toBeAttached();
  }
};

/** When running on desktop, the user is prompted to transfer to a mobile device for the id doc and
 * liveness requirements.
 * This transfers to a mobile device and handles the liveness requirement.
 */
export const doTransferFromDesktop = async ({
  frame,
  page,
  browser,
}: {
  frame: FrameLocator | Page;
  page: Page;
  browser: Browser;
}) => {
  const requestPromise = page.waitForRequest('**/d2p/sms');
  const header = frame.getByText(/add a passkey/i).first();
  await header.waitFor({ state: 'attached', timeout: 10000 });

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(4000); // We need to give a moment for the QR code to be generated

  const request = await requestPromise;
  const handoffUrl = request.postDataJSON().url;
  expect(handoffUrl).toBeDefined();

  const iPhone = devices['iPhone 13'];
  const popup = await browser.newPage({
    baseURL: handoffUrl,
    ...iPhone,
  });
  await popup.goto(handoffUrl);
  await popup.waitForLoadState();

  const popupHeader = popup.getByText('Please continue on your computer.').first();
  await popupHeader.waitFor({ state: 'attached', timeout: 5000 }).catch(() => false); // Increasing the waiting time for CI
};

export const doTransferFromSocialMediaBrowser = async ({
  frame,
  page,
  browser,
}: {
  frame: FrameLocator;
  page: Page;
  browser: Browser;
}) => {
  const requestPromise = page.waitForRequest('**/d2p/sms');
  const header = frame.getByText(/check your messages/i).first();
  await header.waitFor({ state: 'attached', timeout: 10000 });

  const request = await requestPromise;
  const handoffUrl = request.postDataJSON().url;
  expect(handoffUrl).toBeDefined();

  const iPhone = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone,
  });
  const handoffPage = await context.newPage();
  await handoffPage.goto(handoffUrl);
  await handoffPage.waitForLoadState();

  const handoffHeader = handoffPage.getByText(/continue/i).first();
  await handoffHeader.waitFor({ state: 'attached', timeout: 10000 });

  await handoffPage.waitForLoadState();
  await clickOnContinue(handoffPage);
  await handoffPage
    .getByText(/Optional/i)
    .first()
    .scrollIntoViewIfNeeded();

  return handoffPage;
};

export const doTransferFromMobile = async ({
  frame,
  browser,
}: {
  frame: FrameLocator | Page;
  browser: Browser;
}) => {
  const context = browser.contexts()[0];
  const pagePromise = context.waitForEvent('page');
  const btn = frame
    .getByRole('button', {
      name: 'Open new browser tab',
      disabled: false,
      exact: true,
    })
    .first();
  await btn.waitFor({ state: 'attached', timeout: 10000 }).then(() => btn.click());

  const newPage = await pagePromise;
  await newPage.waitForLoadState();

  const header = newPage.getByText(/add a passkey/i).first();
  await header.waitFor({ state: 'attached', timeout: 10000 });
  await clickOn(/launch verification/i, newPage);
  await clickOn(/do it later/i, newPage);

  return newPage;
};

/** When running on desktop, the user is prompted to transfer to a mobile device for the id doc and
 * liveness requirements.
 * This continues on desktop instead of doing the transfer. We then end up handling the liveness and
 * ID doc requirements in the current browser.
 */
export const continueOnDesktop = async (frame: FrameLocator) => {
  let success = await clickOn(/continue on desktop/i, frame);
  if (!success) {
    await clickOn(/continue on desktop/i, frame);
  }
  success = await clickOn(/continue on desktop/i, frame);
  if (!success) {
    await clickOn(/continue on desktop/i, frame);
  }
};

export const verifyAppIframeClick = async (page: Page, isMobile: boolean) => {
  const btn = page.getByRole('button', { name: 'Verify with Footprint' });
  await btn.waitFor({ state: 'attached', timeout: isMobile ? 40000 : 20000 });
  await btn.first().click();
};
