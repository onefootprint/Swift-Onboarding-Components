import type {
  BusinessDI,
  CardDI,
  CustomDI,
  DataIdentifier,
  DocumentDI,
  IdDI,
  InvestorProfileDI,
} from '@onefootprint/types';
import { DataIdentifierKeys } from '@onefootprint/types';

export const isCardDI = (id: string): id is CardDI => id.startsWith('card.');

export const isCustomDI = (id: string): id is CustomDI => id.startsWith('custom.');

const isValidDI = (id?: string) => {
  if (!id) {
    return false;
  }
  if (isCardDI(id as DataIdentifier)) {
    return true;
  }
  if (isCustomDI(id as DataIdentifier)) {
    return true;
  }
  return DataIdentifierKeys.includes(id as InvestorProfileDI | IdDI | BusinessDI | DocumentDI);
};

export default isValidDI;
