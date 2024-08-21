import type { CollectKycDataRequirement, DataIdentifier } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import type { DataValue, KycData } from '../data-types';

export type TaxIdKind = 'ssn4' | 'ssn9' | 'usTaxId' | 'itin';
export enum TaxIdDisplay {
  hidden = 'hidden',
  revealed = 'revealed',
  skipped = 'skipped',
}

const numbersOnly = (s?: string): string => (typeof s === 'string' ? s?.replace(/[^0-9]/g, '') : '');
const toHyphensShape = (s: string) => `${s.slice(0, 3)}-${s.slice(3, 5)}-${s.slice(5)}`;

export const getTaxIdKind = (req: CollectKycDataRequirement): TaxIdKind | undefined => {
  const { missingAttributes, optionalAttributes, populatedAttributes } = req;
  const { usTaxId, ssn9, ssn4 } = CollectedKycDataOption;

  if (
    missingAttributes.includes(usTaxId) ||
    optionalAttributes.includes(usTaxId) ||
    populatedAttributes.includes(usTaxId)
  ) {
    return 'usTaxId';
  }

  if (missingAttributes.includes(ssn9) || optionalAttributes.includes(ssn9) || populatedAttributes.includes(ssn9)) {
    return 'ssn9';
  }

  if (missingAttributes.includes(ssn4) || optionalAttributes.includes(ssn4) || populatedAttributes.includes(ssn4)) {
    return 'ssn4';
  }

  return undefined;
};

export const getTaxIdDataValue = (data: KycData, kind?: TaxIdKind): DataValue<string> | undefined => {
  if (kind === 'ssn4') return data[IdDI.ssn4];
  if (kind === 'ssn9') return data[IdDI.ssn9];
  if (kind === 'usTaxId') return data[IdDI.usTaxId];
  return undefined;
};

export const getTaxIdFields = (kind?: TaxIdKind): DataIdentifier[] => {
  if (kind === 'ssn4') return [IdDI.ssn4];
  if (kind === 'ssn9') return [IdDI.ssn9];
  return [IdDI.itin, IdDI.ssn9, IdDI.usTaxId];
};

export const getTypeOfTaxId = (kind?: TaxIdKind, rawStr?: string): TaxIdKind | undefined => {
  if (!rawStr) return kind;

  const formattedStr = toHyphensShape(numbersOnly(rawStr));
  if (formattedStr.length !== 11) return kind;

  if (kind === 'usTaxId') {
    if (getTaxIdInputPattern('itin').test(formattedStr)) return 'itin';
    if (getTaxIdInputPattern('ssn9').test(formattedStr)) return 'ssn9';
    return undefined;
  }
  if (kind === 'ssn9') {
    return getTaxIdInputPattern('ssn9').test(formattedStr) ? 'ssn9' : undefined;
  }

  return kind;
};

export const taxIdFormatter = (kind: TaxIdKind, str?: string, scrubbed?: boolean) => {
  if (scrubbed) {
    return kind === 'ssn9' || kind === 'usTaxId' || kind === 'itin' ? '•••••••••' : '••••';
  }

  return !str ? '' : str.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3');
};

export const isSsnOptional = (req: CollectKycDataRequirement): boolean =>
  req.optionalAttributes.includes(CollectedKycDataOption.ssn9) ||
  req.optionalAttributes.includes(CollectedKycDataOption.ssn4);

export const getTaxIdInputPattern = (kind: 'ssn9' | 'usTaxId' | 'itin'): RegExp => {
  if (kind === 'ssn9') {
    /** SSN9
     * Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
     * Numbers with 666 or 900–999 in the first digit group are not allowed.
     * Also validates length & formatting.
     */
    return /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/;
  }

  if (kind === 'itin') {
    /** ITIN
     * All valid ITINs are a nine-digit number in the same format as the SSN (9XX-8X-XXXX)
     * begins with a “9”
     * and the 4th and 5th digits range from 50 to 65, 70 to 88, 90 to 92, and 94 to 99
     */
    return /^9\d{2}-(5[0-9]|6[0-5]|7[0-9]|8[0-8]|9[0-2]|9[4-9])-\d{4}$/;
  }

  /** (SSN9 and ITIN) */
  return /^(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$|^9\d{2}-(5[0-9]|6[0-5]|7[0-9]|8[0-8]|9[0-2]|9[4-9])-\d{4}$/;
};
