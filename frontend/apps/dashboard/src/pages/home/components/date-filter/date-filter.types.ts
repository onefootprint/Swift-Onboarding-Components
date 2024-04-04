export type DateFilterPeriod =
  | 'today'
  | 'last-7-days'
  | 'last-4-weeks'
  | 'last-3-months'
  | 'last-12-months'
  | 'month-to-date'
  | 'quarter-to-date'
  | 'year-to-date'
  | 'all-time'
  | 'custom';

export type DateRangeSelectOption = { label: string; value: DateFilterPeriod };

export const DEFAULT_DATE_FILTER_PERIOD: DateFilterPeriod = 'month-to-date';
