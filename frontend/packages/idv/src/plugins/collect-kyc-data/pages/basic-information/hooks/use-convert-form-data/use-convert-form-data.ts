import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const requiresNationality = attributes.includes(
    CollectedKycDataOption.nationality,
  );

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { firstName, middleName, lastName, dob, nationality } = formData;
    const hasName = firstName || middleName || lastName;

    if (requiresName && hasName) {
      const isFirstNameChanged = firstName !== data[IdDI.firstName]?.value;
      convertedData[IdDI.firstName] = {
        value: firstName,
        dirty: isFirstNameChanged,
        bootstrap: isFirstNameChanged ? false : data[IdDI.firstName]?.bootstrap,
        disabled: data[IdDI.firstName]?.disabled ?? false,
        decrypted: isFirstNameChanged ? false : data[IdDI.firstName]?.decrypted,
      };

      const isMiddleNameChanged = middleName !== data[IdDI.middleName]?.value;
      convertedData[IdDI.middleName] = {
        value: middleName,
        dirty: isMiddleNameChanged,
        bootstrap: isMiddleNameChanged
          ? false
          : data[IdDI.middleName]?.bootstrap,
        disabled: data[IdDI.middleName]?.disabled ?? false,
        decrypted: isMiddleNameChanged
          ? false
          : data[IdDI.middleName]?.decrypted,
      };

      const isLastNameChanged = lastName !== data[IdDI.lastName]?.value;
      convertedData[IdDI.lastName] = {
        value: lastName,
        dirty: isLastNameChanged,
        bootstrap: isLastNameChanged ? false : data[IdDI.lastName]?.bootstrap,
        disabled: data[IdDI.lastName]?.disabled ?? false,
        decrypted: isLastNameChanged ? false : data[IdDI.lastName]?.decrypted,
      };
    }

    if (requiresDob && dob) {
      const isChanged = dob !== data[IdDI.dob]?.value;
      convertedData[IdDI.dob] = {
        value: dob,
        dirty: isChanged,
        bootstrap: isChanged ? false : data[IdDI.dob]?.bootstrap,
        disabled: data[IdDI.dob]?.disabled ?? false,
        decrypted: isChanged ? false : data[IdDI.dob]?.decrypted,
      };
    }

    if (requiresNationality && nationality) {
      const isChanged = nationality.value !== data[IdDI.nationality]?.value;
      convertedData[IdDI.nationality] = {
        value: nationality.value,
        dirty: isChanged,
        bootstrap: isChanged ? false : data[IdDI.nationality]?.bootstrap,
        disabled: data[IdDI.nationality]?.disabled ?? false,
        decrypted: isChanged ? false : data[IdDI.nationality]?.decrypted,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
