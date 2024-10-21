import type { DataIdentifier, Entity } from '@onefootprint/types';
import { BusinessDI, EntityKind, IdDI, ListKind } from '@onefootprint/types';
import isDiDecryptable from 'src/utils/is-di-decryptable';

const getAttributeForListKind = (listKind?: ListKind, entity?: Entity): DataIdentifier | undefined => {
  if (!entity || !listKind) {
    return undefined;
  }
  const { kind } = entity;

  switch (listKind) {
    case ListKind.emailAddress: {
      return isDiDecryptable(entity, IdDI.email) ? IdDI.email : undefined;
    }

    case ListKind.emailDomain: {
      return isDiDecryptable(entity, IdDI.email) ? IdDI.email : undefined;
    }

    case ListKind.phoneNumber: {
      const rawAttribute = kind === EntityKind.business ? BusinessDI.phoneNumber : IdDI.phoneNumber;
      const attribute = isDiDecryptable(entity, rawAttribute) ? rawAttribute : undefined;
      return attribute;
    }

    case ListKind.phoneCountryCode: {
      const rawAttribute = kind === EntityKind.business ? BusinessDI.phoneNumber : IdDI.phoneNumber;
      const attribute = isDiDecryptable(entity, rawAttribute) ? rawAttribute : undefined;
      return attribute;
    }

    case ListKind.ssn9: {
      return isDiDecryptable(entity, IdDI.ssn9) ? IdDI.ssn9 : undefined;
    }

    case ListKind.ipAddress: {
      return undefined;
    }

    default:
      return undefined;
  }
};

export default getAttributeForListKind;
