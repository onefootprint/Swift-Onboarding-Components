import type { CountryCode } from '@onefootprint/types';
import { IdDI, UsLegalStatus } from '@onefootprint/types';
import uniq from 'lodash/uniq';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { KycData } from '../../../../utils/data-types';
import updateDataValue from '../../../../utils/update-data-value';
import type { FormData } from '../../types';

const eqSet = (set1: Set<string>, set2: Set<string>) =>
  set1.size === set2.size && Array.from(set1).every(x => set2.has(x));

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  return (formData: FormData) => {
    const { usLegalStatus, nationality, citizenships, visa } = formData;

    const convertedData: KycData = {
      [IdDI.usLegalStatus]: updateDataValue(usLegalStatus, data[IdDI.usLegalStatus]),
      [IdDI.nationality]: updateDataValue(nationality.value, data[IdDI.nationality]),
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
      citizenships?.filter(({ value }) => !!value).map(({ value }) => value as CountryCode),
    );
    if (citizenshipValues && citizenshipValues.length > 0) {
      convertedData[IdDI.citizenships] = updateDataValue(
        citizenshipValues,
        data[IdDI.citizenships],
        (a?: CountryCode[], b?: CountryCode[]) => {
          const existingSet = new Set(a ?? []);
          const newSet = new Set(b ?? []);
          return eqSet(existingSet, newSet);
        },
      );
    }

    if (usLegalStatus === UsLegalStatus.visa) {
      if (visa?.expirationDate) {
        convertedData[IdDI.visaExpirationDate] = updateDataValue(visa.expirationDate, data[IdDI.visaExpirationDate]);
      }
      if (visa?.kind) {
        convertedData[IdDI.visaKind] = updateDataValue(visa.kind.value, data[IdDI.visaKind]);
      }
    }

    return convertedData;
  };
};

export default useConvertFormData;
