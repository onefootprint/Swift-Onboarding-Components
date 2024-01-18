import { FiltersDateRange } from '../drawer-filter.type';

const useDateOptions = () => [
  { value: FiltersDateRange.AllTime, label: 'All-time' },
  { value: FiltersDateRange.Today, label: 'Today' },
  { value: FiltersDateRange.Last7Days, label: 'Last 7 days' },
  { value: FiltersDateRange.Last30Days, label: 'Last 30 days' },
  { value: FiltersDateRange.Custom, label: 'Custom' },
];

export default useDateOptions;
