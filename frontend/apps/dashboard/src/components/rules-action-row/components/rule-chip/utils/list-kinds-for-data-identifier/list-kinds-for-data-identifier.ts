import type { DataIdentifier } from '@onefootprint/types';
import { BusinessDI, IdDI, ListKind } from '@onefootprint/types';

const listKindsForDataIdentifier = (di?: DataIdentifier): ListKind[] => {
  if (!di) {
    // TODO: adjust when ipAddress is implemented on the BE
    return Object.values(ListKind).filter(kind => kind !== ListKind.ipAddress);
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

    default:
      return [];
  }
};

export default listKindsForDataIdentifier;
