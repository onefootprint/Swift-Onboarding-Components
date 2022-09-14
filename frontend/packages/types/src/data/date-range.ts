export enum DateRange {
  allTime = 'allTime',
  today = 'today',
  currentMonth = 'currentMonth',
  lastWeek = 'lastWeek',
  lastMonth = 'lastMonth',
  custom = 'custom',
}

export const dateRangeToDisplayText = {
  [DateRange.allTime]: 'All time',
  [DateRange.today]: 'Today',
  [DateRange.currentMonth]: 'Current month',
  [DateRange.lastWeek]: 'Last week',
  [DateRange.lastMonth]: 'Last month',
  [DateRange.custom]: 'Custom',
};
