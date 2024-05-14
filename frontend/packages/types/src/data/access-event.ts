import type { InsightEvent } from './insight-event';

export type AccessEventKind = 'decrypt_user_data';

export type AccessEventName = 'decrypt_user_data';

export type AccessEvent = {
  id: string;
  timestamp: string;
  tenantId: string;
  name: AccessEventName;
  principal: {
    kind: string;
    id?: string;
    name?: string;
    member?: string;
  };
  insightEvent?: InsightEvent;
  detail: {
    kind: AccessEventKind;
    data: {
      fpId: string;
      reason: string;
      decryptedFields: string[];
    };
  };
};

export type TransformedAccessEvent = {
  targets: string[];
  kind: AccessEventKind;
  fpId: string;
  reason?: string;
  tenantId: string;
  timestamp: string;
  principal: string;
  insightEvent?: InsightEvent;
};
