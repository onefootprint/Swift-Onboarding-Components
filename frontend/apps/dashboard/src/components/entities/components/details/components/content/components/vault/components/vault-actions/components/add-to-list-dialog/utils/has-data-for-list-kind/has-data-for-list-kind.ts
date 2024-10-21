import type { Entity, InsightEvent } from '@onefootprint/types';
import { BusinessDI, IdDI, ListKind } from '@onefootprint/types';
import isDiDecryptable from 'src/utils/is-di-decryptable';

const hasDataForListKind = (listKind?: ListKind, entity?: Entity) => {
  if (!entity || !listKind) {
    return false;
  }

  switch (listKind) {
    case ListKind.emailDomain:
    case ListKind.emailAddress: {
      return isDiDecryptable(entity, IdDI.email);
    }

    case ListKind.phoneCountryCode:
    case ListKind.phoneNumber: {
      return isDiDecryptable(entity, IdDI.phoneNumber) || isDiDecryptable(entity, BusinessDI.phoneNumber);
    }

    case ListKind.ssn9: {
      return isDiDecryptable(entity, IdDI.ssn9);
    }

    case ListKind.ipAddress: {
      const insightEvents = (entity.workflows.map(wf => wf.insightEvent).filter(ie => !!ie) as InsightEvent[]).flat();
      const ipAddresses = insightEvents.map(event => event.ipAddress).filter(ip => !!ip) as string[];
      return ipAddresses.length > 0;
    }

    default:
      return false;
  }
};

export default hasDataForListKind;
