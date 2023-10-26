import type { CountryCode } from '@onefootprint/types';
import { IdDI, UsLegalStatus } from '@onefootprint/types';
import uniq from 'lodash/uniq';

import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const useConvertFormData = () => (formData: FormData) => {
  const { usLegalStatus, nationality, citizenships, visa } = formData;
  const convertedData: KycData = {
    [IdDI.usLegalStatus]: {
      value: usLegalStatus,
    },
    [IdDI.nationality]: {
      value: nationality.value,
    },
    [IdDI.citizenships]: {
      value: undefined,
    },
    [IdDI.visaExpirationDate]: {
      value: undefined,
    },
    [IdDI.visaKind]: {
      value: undefined,
    },
  };

  if (usLegalStatus === UsLegalStatus.citizen) {
    return convertedData;
  }

  const citizenshipValues = uniq(
    citizenships
      ?.filter(({ value }) => !!value)
      .map(({ value }) => value as CountryCode),
  );
  if (citizenshipValues && citizenshipValues.length > 0) {
    convertedData[IdDI.citizenships] = {
      value: citizenshipValues,
    };
  }

  if (usLegalStatus === UsLegalStatus.visa) {
    if (visa?.expirationDate) {
      convertedData[IdDI.visaExpirationDate] = {
        value: visa.expirationDate,
      };
    }
    if (visa?.kind) {
      convertedData[IdDI.visaKind] = {
        value: visa.kind.value,
      };
    }
  }

  return convertedData;
};

export default useConvertFormData;
