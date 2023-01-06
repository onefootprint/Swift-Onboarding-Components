export enum Period {
  AllTime = 'all-time',
  Today = 'today',
  Last7Days = 'last-7-days',
  Last30Days = 'last-30-days',
  Custom = 'custom',
}

const useDateOptions = () => [
  { value: Period.AllTime, label: 'All-time' },
  { value: Period.Today, label: 'Today' },
  { value: Period.Last7Days, label: 'Last 7 days' },
  { value: Period.Last30Days, label: 'Current month' },
  { value: Period.Custom, label: 'Custom' },
];

export default useDateOptions;
