import { CountryCode, IdDI } from '@onefootprint/types';
import uniq from 'lodash/uniq';

import { KycData } from '../../../../utils/data-types';
import { FormData } from '../../types';

const useConvertFormData = () => (formData: FormData) => {
  const convertedData: KycData = {};
  const { usLegalStatus, nationality, citizenships, visa } = formData;

  convertedData[IdDI.usLegalStatus] = {
    value: usLegalStatus,
  };
  if (nationality) {
    convertedData[IdDI.nationality] = {
      value: nationality.value,
    };
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

  return convertedData;
};

export default useConvertFormData;
