import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';
import allAttributes from '@/utils/all-attributes';

import type { FormData } from '../../types';

const convertFormData = ({
  requirement,
  data,
  formData,
}: {
  requirement: CollectKycDataRequirement;
  data: KycData;
  formData: FormData;
}) => {
  const isSsn4Disabled = data?.[IdDI.ssn4]?.disabled;
  const isSsn9Disabled = data?.[IdDI.ssn9]?.disabled;
  const requiresSsn9 = allAttributes(requirement).includes(CollectedKycDataOption.ssn9);

  const convertedData: KycData = {};
  const { ssn } = formData;

  // Only one of ssn4 vs ssn9 will be present
  if (requiresSsn9) {
    if (ssn && !isSsn9Disabled) {
      convertedData[IdDI.ssn9] = {
        value: ssn,
      };
    }
  } else if (ssn && !isSsn4Disabled) {
    convertedData[IdDI.ssn4] = {
      value: ssn,
    };
  }

  return convertedData;
};

export default convertFormData;
