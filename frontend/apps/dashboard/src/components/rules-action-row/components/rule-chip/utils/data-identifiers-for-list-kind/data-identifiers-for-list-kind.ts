import type { DataIdentifier } from '@onefootprint/types';
import {
  BusinessDI,
  DataIdentifierKeys,
  IdDI,
  ListKind,
} from '@onefootprint/types';

const dataIdentifiersForListKind = (listKind?: ListKind): DataIdentifier[] => {
  if (!listKind) {
    return DataIdentifierKeys;
  }

  switch (listKind) {
    case ListKind.emailDomain:
    case ListKind.emailAddress: {
      return [IdDI.email];
    }

    case ListKind.phoneCountryCode:
    case ListKind.phoneNumber: {
      return [IdDI.phoneNumber, BusinessDI.phoneNumber];
    }

    case ListKind.ssn9: {
      return [IdDI.ssn9];
    }

    default:
      return [];
  }
};

export default dataIdentifiersForListKind;
