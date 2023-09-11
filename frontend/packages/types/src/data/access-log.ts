import type { InsightEvent } from './insight-event';

export enum AccessLogKind {
  Decrypt = 'decrypt',
  Update = 'update',
}

export type AccessLog = {
  targets: string[];
  kind: AccessLogKind;
  fpUserId: string;
  reason?: string;
  tenantId: string;
  timestamp: string;
  principal: string;
  insightEvent?: InsightEvent;
};
