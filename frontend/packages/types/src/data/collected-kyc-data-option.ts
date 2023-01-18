import UserDataAttribute from './user-data-attribute';

export enum CollectedKycDataOption {
  name = 'name',
  dob = 'dob',
  ssn4 = 'ssn4',
  ssn9 = 'ssn9',
  fullAddress = 'full_address',
  partialAddress = 'partial_address',
  email = 'email',
  phoneNumber = 'phone_number',
}

// Labels sent from the backend for each attribute
export const CollectedKycDataOptionLabels: Record<
  string,
  CollectedKycDataOption
> = {
  name: CollectedKycDataOption.name,
  dob: CollectedKycDataOption.dob,
  email: CollectedKycDataOption.email,
  ssn9: CollectedKycDataOption.ssn9,
  ssn4: CollectedKycDataOption.ssn4,
  full_address: CollectedKycDataOption.fullAddress,
  partial_address: CollectedKycDataOption.partialAddress,
  phone_number: CollectedKycDataOption.phoneNumber,
};

export const OptionToRequiredAttributes: Record<
  CollectedKycDataOption,
  UserDataAttribute[]
> = {
  [CollectedKycDataOption.name]: [
    UserDataAttribute.firstName,
    UserDataAttribute.lastName,
  ],
  [CollectedKycDataOption.dob]: [UserDataAttribute.dob],
  [CollectedKycDataOption.ssn4]: [UserDataAttribute.ssn4],
  [CollectedKycDataOption.ssn9]: [UserDataAttribute.ssn9],
  [CollectedKycDataOption.fullAddress]: [
    UserDataAttribute.addressLine1,
    UserDataAttribute.city,
    UserDataAttribute.state,
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedKycDataOption.partialAddress]: [
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedKycDataOption.email]: [UserDataAttribute.email],
  [CollectedKycDataOption.phoneNumber]: [UserDataAttribute.phoneNumber],
};
