import type { CountryCode } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  IdDI,
  isCountryCode,
} from '@onefootprint/types';

import type { ReturnOfCollectKycDataMachine } from '../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../utils/all-attributes/all-attributes';
import getInitialCountry from '../../utils/get-initial-country';

type State = ReturnOfCollectKycDataMachine[0];
type StateContext = State['context'];
const isTest = process.env.NODE_ENV === 'test';

const getCountryCode = (code?: CountryCode) =>
  code && isCountryCode(code) ? code : undefined;

const getFieldStats = ({ data, requirement }: StateContext) => {
  const attributes = allAttributes(requirement);
  const disabledFirstName = Boolean(data?.[IdDI.firstName]?.disabled);
  const disabledMiddleName = Boolean(data?.[IdDI.middleName]?.disabled);
  const disableLastName = Boolean(data?.[IdDI.lastName]?.disabled);
  const isNameRequired = attributes.includes(CollectedKycDataOption.name);

  return {
    fullName: {
      bootstrap: undefined,
      decrypted: undefined,
      disabled: disabledFirstName || disabledMiddleName || disableLastName,
      required: isNameRequired,
      value: undefined,
    },
    firstName: {
      bootstrap: Boolean(data[IdDI.firstName]?.bootstrap),
      decrypted: Boolean(data[IdDI.firstName]?.decrypted),
      disabled: disabledFirstName,
      required: isNameRequired,
      value: data[IdDI.firstName]?.value,
    },
    middleName: {
      bootstrap: Boolean(data[IdDI.middleName]?.bootstrap),
      decrypted: Boolean(data[IdDI.middleName]?.decrypted),
      disabled: disabledMiddleName,
      required: isNameRequired,
      value: data[IdDI.middleName]?.value,
    },
    lastName: {
      bootstrap: Boolean(data[IdDI.lastName]?.bootstrap),
      decrypted: Boolean(data[IdDI.lastName]?.decrypted),
      disabled: disableLastName,
      required: isNameRequired,
      value: data[IdDI.lastName]?.value,
    },
    dob: {
      bootstrap: Boolean(data?.[IdDI.dob]?.bootstrap),
      decrypted: Boolean(data?.[IdDI.dob]?.decrypted),
      disabled: Boolean(data?.[IdDI.dob]?.disabled),
      required: attributes.includes(CollectedKycDataOption.dob),
      value: data?.[IdDI.dob]?.value,
    },
    nationality: {
      bootstrap: Boolean(data?.[IdDI.nationality]?.bootstrap),
      decrypted: Boolean(data?.[IdDI.nationality]?.decrypted),
      disabled: Boolean(data?.[IdDI.nationality]?.disabled),
      required: attributes.includes(CollectedKycDataOption.nationality),
      value: getInitialCountry(getCountryCode(data?.[IdDI.nationality]?.value)),
    },
    phone: {
      bootstrap: Boolean(data?.[IdDI.phoneNumber]?.bootstrap),
      decrypted: Boolean(data?.[IdDI.phoneNumber]?.decrypted),
      disabled: Boolean(data?.[IdDI.phoneNumber]?.disabled),
      required:
        !isTest && attributes.includes(CollectedKycDataOption.phoneNumber),
      value: data?.[IdDI.phoneNumber]?.value,
    },
    email: {
      bootstrap: Boolean(data?.[IdDI.email]?.bootstrap),
      decrypted: Boolean(data?.[IdDI.email]?.decrypted),
      disabled: Boolean(data?.[IdDI.email]?.disabled),
      required: !isTest && attributes.includes(CollectedKycDataOption.email),
      value: data?.[IdDI.email]?.value,
    },
  };
};

export default getFieldStats;
