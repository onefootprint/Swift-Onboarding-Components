import {
  mockRequest,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';

import getFormIdForState from '../../utils/get-form-id-for-state';

export const onboardingConfig = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: ['name', 'dob', 'document'],
  can_access_data: ['dob', 'document'],
  is_live: true,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
};

export const listOnboardingConfigsFixture = [onboardingConfig];

export const withCreateOnboardingConfig = (
  data = listOnboardingConfigsFixture,
) =>
  mockRequest({
    method: 'post',
    path: '/org/onboarding_configs',
    response: {
      data,
    },
  });

export const EMAIL_LABEL = 'Email';
export const PHONE_LABEL = 'Phone number';
export const NAME_LABEL = 'Full name';
export const DOB_LABEL = 'Date of birth';
export const ADDRESS_LABEL = 'Address';
export const SSN_FULL_LABEL = 'SSN (Full)';
export const SSN_LAST_FOUR_LABEL = 'SSN (Last 4)';
export const NATIONALITY_LABEL = 'Nationality';
export const ID_DOCUMENT_LABEL = 'ID Document';
export const SELFIE_LABEL = 'Selfie';
export const ID_DOCUMENT_AND_SELFIE_LABEL = 'ID Document & Selfie';
export const INVESTOR_PROFILE_LABEL = 'Investor profile';

export const NATIONALITY_OPTION = 'Request users to specify their nationality';
export const ID_CARD_OPTION = 'ID card';
export const PASSPORT_OPTION = 'Passport';
export const DRIVERS_LICENSE_OPTION = "Driver's license";
export const SELFIE_OPTION = 'Request a selfie';
export const INVESTOR_PROFILE_OPTION = 'Ask investor profile questions';

export const BUSINESS_NAME_LABEL = 'Business name';
export const BUSINESS_TIN_LABEL = 'Taxpayer Identification Number (TIN)';
export const BUSINESS_ADDRESS_LABEL = 'Registered business address';
export const BENEFICIAL_OWNERS_LABEL = 'Business beneficial owners';
export const BUSINESS_WEBSITE_LABEL = 'Business website';
export const BUSINESS_PHONE_LABEL = 'Business phone number';
export const BUSINESS_BO_FULL_KYC_LABEL =
  'Business beneficial owners (Fully-KYCed)';

export const BUSINESS_BO_FULL_KYC_OPTION = 'Fully KYC all beneficial owners';

export const toggleCollectOption = async (
  optionLabel: string,
  collectedDataLabel: string,
  isSelected: boolean,
) => {
  const option = screen.getByLabelText(optionLabel);
  await userEvent.click(option);
  const collectedData = getCollectedData();

  if (isSelected) {
    expect(
      within(collectedData).getByText(collectedDataLabel),
    ).toBeInTheDocument();
  } else {
    expect(
      within(collectedData).queryByText(collectedDataLabel),
    ).not.toBeInTheDocument();
  }
};

export const toggleAccessOption = async (
  optionLabel: string,
  isSelected: boolean,
) => {
  const option = screen.getByLabelText(optionLabel) as HTMLInputElement;
  if (isSelected) {
    expect(option.checked).toBeFalsy();
  } else {
    expect(option.checked).toBeTruthy();
  }
  await userEvent.click(option);
  if (isSelected) {
    expect(option.checked).toBeTruthy();
  } else {
    expect(option.checked).toBeFalsy();
  }
};

export const clickNext = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
};

export const clickBack = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
};

export const clickSave = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
};

export const selectType = async (kyb?: boolean) => {
  expect(screen.getByTestId(getFormIdForState('type'))).toBeInTheDocument();
  if (kyb) {
    const kybOption = screen.getByLabelText('KYB') as HTMLButtonElement;
    await userEvent.click(kybOption);
  }
  await clickNext();
};

export const fillName = async () => {
  expect(screen.getByTestId(getFormIdForState('name'))).toBeInTheDocument();
  const nameInput = screen.getByLabelText('Onboarding configuration name');
  await userEvent.type(nameInput, 'Test name');
  await clickNext();
};

export const fillKycCollect = async () => {
  expect(
    screen.getByTestId(getFormIdForState('kycCollect')),
  ).toBeInTheDocument();
  await clickNext();
};

export const fillKycAccess = async () => {
  expect(
    screen.getByTestId(getFormIdForState('kycAccess')),
  ).toBeInTheDocument();
  await clickSave();
};

export const fillInvestorProfile = async (isSelected?: boolean) => {
  expect(
    screen.getByTestId(getFormIdForState('kycInvestorProfile')),
  ).toBeInTheDocument();
  if (isSelected) {
    await toggleCollectOption(
      INVESTOR_PROFILE_OPTION,
      INVESTOR_PROFILE_LABEL,
      true,
    );
  }
  await clickNext();
};

export const fillKybCollect = async () => {
  expect(
    screen.getByTestId(getFormIdForState('kybCollect')),
  ).toBeInTheDocument();
  await clickNext();
};

export const fillKybAccess = async () => {
  expect(
    screen.getByTestId(getFormIdForState('kybAccess')),
  ).toBeInTheDocument();
  await clickSave();
};

const getCollectedData = () => screen.getByTestId('collected-data');

export const checkCollectedDataExists = async (labels: string[]) => {
  const collectedData = getCollectedData();
  labels.forEach(label => {
    expect(within(collectedData).getByText(label)).toBeInTheDocument();
  });
};

export const checkCollectedDataDoesNotExist = async (labels: string[]) => {
  const collectedData = getCollectedData();
  labels.forEach(label => {
    expect(within(collectedData).queryByText(label)).not.toBeInTheDocument();
  });
};
