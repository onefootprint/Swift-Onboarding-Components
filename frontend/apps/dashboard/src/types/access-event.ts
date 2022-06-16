import { DataKind } from './data-kind';
import { InsightEvent } from './insight-event';

export type AccessEvent = {
  dataKinds: DataKind[];
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal?: string;
  insightEvent?: InsightEvent;
};
