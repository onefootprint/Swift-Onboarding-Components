import type { DataIdentifier, EntityVault, VaultValue } from '@onefootprint/types';
import { BusinessDI, IdDI } from '@onefootprint/types';
import EMPTY_SELECT_VALUE from '../../../../constants';
import type { EditSubmitData } from '../../../../vault.types';
import formatDisplayDate from '../format-display-date';

const convertFormData = (data: Record<string, VaultValue>, previousData?: EntityVault) => {
  const convertedData = {} as EditSubmitData;

  Object.keys(data).forEach((key: string) => {
    const di = key as DataIdentifier;
    const value = data[key];

    // TODO: this logic depends on the fact that we only can edit IdDI and BusinessDI data for now. Need to make it more generic
    const valueNotEditable = typeof value === 'object' && !Array.isArray(value) && value !== null;
    if (valueNotEditable) return;

    const editedValue = getEditedValue(di, value, previousData);
    if (editedValue !== undefined) {
      convertedData[di] = editedValue;
    }
  });

  // Deletion quirk: if status is changed, unchanged legal status-related fields are overwritten
  if (convertedData[IdDI.usLegalStatus]) {
    const legalStatusDIs = [IdDI.nationality, IdDI.citizenships, IdDI.visaKind, IdDI.visaExpirationDate];
    legalStatusDIs.forEach(di => {
      const previousValue = previousData?.[di];
      const wasUnchanged = !(di in convertedData);
      if (!!previousValue && wasUnchanged) {
        convertedData[di] = previousValue;
      }
    });
  }

  return convertedData;
};

// Returns undefined for unedited, null for deleted, and the new value for edited values
const getEditedValue = (di: DataIdentifier, formValue: VaultValue, previousData?: EntityVault): VaultValue => {
  let value = formValue;
  const previousValue = previousData?.[di];

  if (value === (EMPTY_SELECT_VALUE as VaultValue)) {
    value = null;
  }
  if (di === IdDI.citizenships && value) {
    value = (value as string).split(', ');
  }

  // If the value was changed, return the new value
  const isDeleted = !!previousValue && !value;
  if (isDeleted) return null;

  const stayedEmpty = (!previousData || !previousValue) && !value;
  const isEdited =
    di === IdDI.citizenships ? JSON.stringify(previousValue) !== JSON.stringify(value) : previousValue !== value;
  if (!stayedEmpty && isEdited) {
    const dateDIs: DataIdentifier[] = [IdDI.visaExpirationDate, IdDI.dob, BusinessDI.formationDate];
    if (dateDIs.includes(di) && value) {
      value = formatDisplayDate(value as string);
    }
    return value;
  }

  // The value was unchanged
  return undefined;
};

export default convertFormData;
