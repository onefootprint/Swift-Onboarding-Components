import { InsightEvent } from './insight-event';

export enum AccessEventKind {
  Decrypt = 'decrypt',
  Update = 'update',
}

export type AccessEvent = {
  targets: string[];
  kind: AccessEventKind;
  fpUserId: string;
  reason?: string;
  tenantId: string;
  timestamp: string;
  principal: string;
  insightEvent?: InsightEvent;
};
