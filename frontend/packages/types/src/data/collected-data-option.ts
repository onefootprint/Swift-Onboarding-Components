import { UserDataAttribute } from './user-data-attribute';

export enum CollectedDataOption {
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
export const CollectedDataOptionLabels: Record<string, CollectedDataOption> = {
  name: CollectedDataOption.name,
  dob: CollectedDataOption.dob,
  email: CollectedDataOption.email,
  ssn9: CollectedDataOption.ssn9,
  ssn4: CollectedDataOption.ssn4,
  full_address: CollectedDataOption.fullAddress,
  partial_address: CollectedDataOption.partialAddress,
  phone_number: CollectedDataOption.phoneNumber,
};

export const OptionToRequiredAttributes: Record<
  CollectedDataOption,
  UserDataAttribute[]
> = {
  [CollectedDataOption.name]: [
    UserDataAttribute.firstName,
    UserDataAttribute.lastName,
  ],
  [CollectedDataOption.dob]: [UserDataAttribute.dob],
  [CollectedDataOption.ssn4]: [UserDataAttribute.ssn4],
  [CollectedDataOption.ssn9]: [UserDataAttribute.ssn9],
  [CollectedDataOption.fullAddress]: [
    UserDataAttribute.addressLine1,
    UserDataAttribute.city,
    UserDataAttribute.state,
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedDataOption.partialAddress]: [
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedDataOption.email]: [UserDataAttribute.email],
  [CollectedDataOption.phoneNumber]: [UserDataAttribute.phoneNumber],
};
