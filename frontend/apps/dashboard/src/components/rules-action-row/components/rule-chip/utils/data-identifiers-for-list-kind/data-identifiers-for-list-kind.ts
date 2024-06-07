import type { DataIdentifier } from '@onefootprint/types';
import { BusinessDI, DataIdentifierKeys, IdDI, ListKind } from '@onefootprint/types';

export const IP_ADDRESS_DATA_IDENTIFIER = 'ip_address';

const dataIdentifiersForListKind = (listKind?: ListKind): (DataIdentifier | string)[] => {
  if (!listKind) {
    return [...DataIdentifierKeys, IP_ADDRESS_DATA_IDENTIFIER].sort();
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

    case ListKind.ipAddress: {
      return [IP_ADDRESS_DATA_IDENTIFIER];
    }

    default:
      return [];
  }
};

export default dataIdentifiersForListKind;
