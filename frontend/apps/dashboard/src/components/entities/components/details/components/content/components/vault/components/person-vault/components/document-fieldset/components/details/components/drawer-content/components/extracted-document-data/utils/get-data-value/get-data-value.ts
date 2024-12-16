import type { DocumentDI, VaultValue } from '@onefootprint/types';
import { isVaultDataText } from '@onefootprint/types';
import { format, parseISO } from 'date-fns';
import startCase from 'lodash/startCase';
import getDataLabel from '../get-data-label';

// Formats dates to be MM/dd/yyyy and strings to be title case. Preserve 2-letter country/state codes in uppercase.
const getDataValueString = (vaultValue: VaultValue, key: DocumentDI, activeDocumentVersion: string) => {
  const valueString = isVaultDataText(vaultValue) ? vaultValue : JSON.stringify(vaultValue);
  if (!valueString) return '-';

  const field = getDataLabel(key, activeDocumentVersion);
  const titleCaseFields = [
    'full_name',
    'gender',
    'full_address',
    'issuing_country',
    'issuing_state',
    'document_type',
    'nationality',
    'curp',
  ];
  const dateFields = ['dob', 'issued_at', 'expires_at'];
  if (titleCaseFields.includes(field)) {
    return startCase(valueString.toLowerCase()).replace(/\b[a-zA-Z]{2}\b/g, match => match.toUpperCase());
  }
  if (dateFields.includes(field)) {
    return format(parseISO(valueString), 'MM/dd/yyyy');
  }
  return valueString;
};

export default getDataValueString;
