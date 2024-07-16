import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';

import allAttributes from '../../../../utils/all-attributes';
import type { FormData } from '../../types';

const convertFormData = ({
  requirement,
  data,
  formData,
}: {
  requirement: CollectKycDataRequirement;
  data?: KycData;
  formData: FormData;
}) => {
  const isNameDisabled = data?.[IdDI.firstName]?.disabled || data?.[IdDI.lastName]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);

  const convertedData: KycData = {};
  const { firstName, middleName, lastName, dob } = formData;
  const hasName = firstName || middleName || lastName;

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

  if (requiresDob && !isDobDisabled && dob) {
    convertedData[IdDI.dob] = { value: dob };
  }

  return convertedData;
};

export default convertFormData;
