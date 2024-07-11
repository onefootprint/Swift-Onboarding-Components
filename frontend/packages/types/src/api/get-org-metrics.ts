import type { OrgMetricsResponse } from '../data';

export type GetOrgMetricsRequest = {
  playbook_id?: string;
  timestamp_gte?: string | Date;
  timestamp_lte?: string | Date;
};

export type GetOrgMetricsResponse = OrgMetricsResponse;
