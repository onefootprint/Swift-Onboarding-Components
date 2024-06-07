import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import updateDataValue from '../../../../utils/update-data-value';
import type { FormData } from '../../types';

const isTest = process.env.NODE_ENV === 'test';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const requiresNationality = attributes.includes(CollectedKycDataOption.nationality);
  const requiresEmail = !isTest && attributes.includes(CollectedKycDataOption.email);
  const requiresPhone = !isTest && attributes.includes(CollectedKycDataOption.phoneNumber);

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { firstName, middleName, lastName, dob, nationality, email, phoneNumber } = formData;
    const hasName = firstName || middleName || lastName;

    if (requiresName && hasName) {
      convertedData[IdDI.firstName] = updateDataValue(firstName, data[IdDI.firstName]);
      convertedData[IdDI.middleName] = updateDataValue(middleName, data[IdDI.middleName]);
      convertedData[IdDI.lastName] = updateDataValue(lastName, data[IdDI.lastName]);
      convertedData[IdDI.firstName] = updateDataValue(firstName, data[IdDI.firstName]);
    }

    if (requiresDob && dob) {
      convertedData[IdDI.dob] = updateDataValue(dob, data[IdDI.dob]);
    }

    if (requiresNationality && nationality) {
      convertedData[IdDI.nationality] = updateDataValue(nationality.value, data[IdDI.nationality]);
    }

    if (requiresEmail && email) {
      convertedData[IdDI.email] = updateDataValue(email, data[IdDI.email]);
    }

    if (requiresPhone && phoneNumber) {
      convertedData[IdDI.phoneNumber] = updateDataValue(phoneNumber, data[IdDI.phoneNumber]);
    }

    return convertedData;
  };
};

export default useConvertFormData;
