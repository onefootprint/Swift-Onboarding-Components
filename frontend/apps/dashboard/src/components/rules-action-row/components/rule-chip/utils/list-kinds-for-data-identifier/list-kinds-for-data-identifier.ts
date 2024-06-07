import type { DataIdentifier } from '@onefootprint/types';
import { BusinessDI, IdDI, ListKind } from '@onefootprint/types';

import { IP_ADDRESS_DATA_IDENTIFIER } from '../data-identifiers-for-list-kind';

const listKindsForDataIdentifier = (di?: DataIdentifier | string): ListKind[] => {
  if (!di) {
    return Object.values(ListKind);
  }

  switch (di) {
    case IdDI.email: {
      return [ListKind.emailDomain, ListKind.emailAddress];
    }

    case IdDI.phoneNumber:
    case BusinessDI.phoneNumber: {
      return [ListKind.phoneCountryCode, ListKind.phoneNumber];
    }

    case IdDI.ssn9: {
      return [ListKind.ssn9];
    }

    case IP_ADDRESS_DATA_IDENTIFIER: {
      return [ListKind.ipAddress];
    }

    default:
      return [];
  }
};

export default listKindsForDataIdentifier;
