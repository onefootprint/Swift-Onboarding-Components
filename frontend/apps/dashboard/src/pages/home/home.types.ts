export enum OrgMetricsDateRange {
  today = 'today',
  last7Days = 'last-7-days',
  last4Weeks = 'last-4-weeks',
  last3Months = 'last-3-months',
  last12Months = 'last-12-months',
  monthToDate = 'month-to-date',
  quarterToDate = 'quarter-to-date',
  yearToDate = 'year-to-date',
  allTime = 'all-time',
}

export type FormattedOrgMetric = {
  key: string;
  value: number | string;
};
