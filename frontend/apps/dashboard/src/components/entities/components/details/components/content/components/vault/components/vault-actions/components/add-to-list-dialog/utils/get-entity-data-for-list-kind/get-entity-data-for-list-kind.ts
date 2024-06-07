import type { EntityVault, EntityWorkflow } from '@onefootprint/types';
import { BusinessDI, EntityKind, IdDI, ListKind } from '@onefootprint/types';

import getIpAddressesFromWorkflows from '../get-ip-addresses-from-workflows';

const getEntityDataForListKind = (
  listKind?: ListKind,
  entityKind?: EntityKind,
  vaultData?: EntityVault,
  workflows: EntityWorkflow[] = [],
): string[] => {
  if (!vaultData || !entityKind || !listKind) {
    return [];
  }

  switch (listKind) {
    case ListKind.emailAddress: {
      const email = vaultData[IdDI.email] as string | undefined;
      return email ? [email] : [];
    }

    case ListKind.emailDomain: {
      const email = vaultData[IdDI.email] as string | undefined;
      const emailParts = email?.split('@');
      const domains = emailParts?.length === 2 ? [emailParts[1]] : [];
      return domains;
    }

    case ListKind.phoneNumber: {
      const rawAttribute = entityKind === EntityKind.business ? BusinessDI.phoneNumber : IdDI.phoneNumber;
      const phoneNumber = vaultData[rawAttribute] as string | undefined;
      return phoneNumber ? [phoneNumber] : [];
    }

    case ListKind.phoneCountryCode: {
      const rawAttribute = entityKind === EntityKind.business ? BusinessDI.phoneNumber : IdDI.phoneNumber;
      const phoneNumber = vaultData[rawAttribute] as string | undefined;
      const match = phoneNumber?.match(/\+(\d{1,3})?(\d{10})/);
      const countryCode = match && match.length > 1 ? match[1] : '';
      return countryCode ? [countryCode] : [];
    }

    case ListKind.ssn9: {
      const ssn9 = vaultData[IdDI.ssn9] as string | undefined;
      return ssn9 ? [ssn9] : [];
    }

    case ListKind.ipAddress: {
      return getIpAddressesFromWorkflows(workflows);
    }

    default:
      return [];
  }
};

export default getEntityDataForListKind;
