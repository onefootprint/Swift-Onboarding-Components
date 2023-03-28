import { DocumentDI, InvestorProfileDI, VaultValue } from '@onefootprint/types';

// TODO: Improve types
// https://linear.app/footprint/issue/FP-3237/improve-investor-profile-decrypt-types
export const allFieldsChecked = (
  fields: {
    title: string;
    fields: {
      canAccess: boolean;
      canSelect: boolean;
      checked: boolean;
      hasPermission: boolean;
      isDataDecrypted: boolean;
      hasValue: boolean;
      label: string;
      name: InvestorProfileDI | DocumentDI;
      showCheckbox: boolean;
      value?: VaultValue;
    }[];
  }[][],
): boolean =>
  fields
    .flatMap(column => column)
    .flatMap(section => section.fields)
    .filter(field => field.canSelect)
    .every(field => field.checked);

export const canSelectAtLeastOne = (
  fields: {
    title: string;
    fields: {
      canAccess: boolean;
      canSelect: boolean;
      checked: boolean;
      hasPermission: boolean;
      isDataDecrypted: boolean;
      hasValue: boolean;
      label: string;
      name: InvestorProfileDI | DocumentDI;
      showCheckbox: boolean;
      value?: VaultValue;
    }[];
  }[][],
): boolean =>
  fields
    .flatMap(column => column)
    .flatMap(section => section.fields)
    .some(field => field.canSelect);
