export enum OrgMetricsDateRange {
  monthToDate = 'month-to-date',
  previousMonth = 'previous-month',
  allTime = 'all-time',
}

export type FormattedOrgMetric = {
  key: string;
  value: number | string;
};
