import type { CountryCode } from '@onefootprint/types';
import { IdDI, UsLegalStatus } from '@onefootprint/types';
import uniq from 'lodash/uniq';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const eqSet = (set1: Set<string>, set2: Set<string>) =>
  set1.size === set2.size && Array.from(set1).every(x => set2.has(x));

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  return (formData: FormData) => {
    const { usLegalStatus, nationality, citizenships, visa } = formData;
    const isLegalStatusChanged =
      usLegalStatus !== data[IdDI.usLegalStatus]?.value;
    const isNationalityDirty =
      nationality.value !== data[IdDI.nationality]?.value;

    const convertedData: KycData = {
      [IdDI.usLegalStatus]: {
        value: usLegalStatus,
        dirty: isLegalStatusChanged,
        bootstrap: isLegalStatusChanged
          ? false
          : data[IdDI.usLegalStatus]?.bootstrap,
        disabled: data[IdDI.usLegalStatus]?.disabled ?? false,
        decrypted: isLegalStatusChanged
          ? false
          : data[IdDI.usLegalStatus]?.decrypted,
      },
      [IdDI.nationality]: {
        value: nationality.value,
        dirty: isNationalityDirty,
        bootstrap: isNationalityDirty
          ? false
          : data[IdDI.nationality]?.bootstrap,
        disabled: data[IdDI.nationality]?.disabled ?? false,
        decrypted: isNationalityDirty
          ? false
          : data[IdDI.nationality]?.decrypted,
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
      const existingSet = new Set(data[IdDI.citizenships]?.value ?? []);
      const newSet = new Set(citizenshipValues);
      const isChanged = !eqSet(existingSet, newSet);
      convertedData[IdDI.citizenships] = {
        value: citizenshipValues,
        dirty: isChanged,
        bootstrap: isChanged ? false : data[IdDI.citizenships]?.bootstrap,
        disabled: data[IdDI.citizenships]?.disabled ?? false,
        decrypted: isChanged ? false : data[IdDI.citizenships]?.decrypted,
      };
    }

    if (usLegalStatus === UsLegalStatus.visa) {
      if (visa?.expirationDate) {
        const isChanged =
          visa.expirationDate !== data[IdDI.visaExpirationDate]?.value;
        convertedData[IdDI.visaExpirationDate] = {
          value: visa.expirationDate,
          dirty: isChanged,
          bootstrap: isChanged
            ? false
            : data[IdDI.visaExpirationDate]?.bootstrap,
          disabled: data[IdDI.visaExpirationDate]?.disabled ?? false,
          decrypted: isChanged
            ? false
            : data[IdDI.visaExpirationDate]?.decrypted,
        };
      }
      if (visa?.kind) {
        const isChanged = visa.kind.value !== data[IdDI.visaKind]?.value;
        convertedData[IdDI.visaKind] = {
          value: visa.kind.value,
          dirty: isChanged,
          bootstrap: isChanged ? false : data[IdDI.visaKind]?.bootstrap,
          disabled: data[IdDI.visaKind]?.disabled ?? false,
          decrypted: isChanged ? false : data[IdDI.visaKind]?.decrypted,
        };
      }
    }

    return convertedData;
  };
};

export default useConvertFormData;
