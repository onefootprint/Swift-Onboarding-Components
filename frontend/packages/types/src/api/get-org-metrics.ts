import type { OrgMetrics } from '../data';

export type GetOrgMetricsRequest = {
  timestamp_gte?: string | Date;
  timestamp_lte?: string | Date;
};

export type GetOrgMetricsResponse = OrgMetrics;
