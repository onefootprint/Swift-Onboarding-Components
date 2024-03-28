import type { DataIdentifier, Entity } from '@onefootprint/types';
import { BusinessDI, EntityKind, IdDI, ListKind } from '@onefootprint/types';

const getAttributeForListKind = (
  listKind?: ListKind,
  entity?: Entity,
): DataIdentifier | undefined => {
  if (!entity || !listKind) {
    return undefined;
  }
  const { kind, decryptableAttributes } = entity;

  switch (listKind) {
    case ListKind.emailAddress: {
      const attribute = decryptableAttributes.includes(IdDI.email)
        ? IdDI.email
        : undefined;
      return attribute;
    }

    case ListKind.emailDomain: {
      const attribute = decryptableAttributes.includes(IdDI.email)
        ? IdDI.email
        : undefined;
      return attribute;
    }

    case ListKind.phoneNumber: {
      const attribute =
        kind === EntityKind.business
          ? BusinessDI.phoneNumber
          : IdDI.phoneNumber;
      return attribute;
    }

    case ListKind.phoneCountryCode: {
      const attribute =
        kind === EntityKind.business
          ? BusinessDI.phoneNumber
          : IdDI.phoneNumber;
      return attribute;
    }

    case ListKind.ssn9: {
      const attribute = decryptableAttributes.includes(IdDI.ssn9)
        ? IdDI.ssn9
        : undefined;
      return attribute;
    }

    case ListKind.ipAddress: {
      return undefined;
    }

    default:
      return undefined;
  }
};

export default getAttributeForListKind;
