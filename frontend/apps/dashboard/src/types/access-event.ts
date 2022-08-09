import { DataKinds } from './data-kind';
import { InsightEvent } from './insight-event';

export type AccessEvent = {
  dataKinds: DataKinds[];
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal?: string;
  insightEvent?: InsightEvent;
};
