import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const isNameDisabled =
    data?.[IdDI.firstName]?.disabled || data?.[IdDI.lastName]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;
  const isNationalityDisabled = data?.[IdDI.nationality]?.disabled;
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const requiresNationality = attributes.includes(
    CollectedKycDataOption.nationality,
  );

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const { firstName, middleName, lastName, dob, nationality } = formData;
    const hasName = firstName && lastName;

    if (requiresName && hasName && !isNameDisabled) {
      convertedData[IdDI.firstName] = {
        value: firstName,
      };

      convertedData[IdDI.middleName] = {
        value: middleName,
      };

      convertedData[IdDI.lastName] = {
        value: lastName,
      };
    }

    if (requiresDob && dob && !isDobDisabled) {
      convertedData[IdDI.dob] = {
        value: dob,
      };
    }

    if (requiresNationality && nationality && !isNationalityDisabled) {
      convertedData[IdDI.nationality] = {
        value: nationality.value,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
