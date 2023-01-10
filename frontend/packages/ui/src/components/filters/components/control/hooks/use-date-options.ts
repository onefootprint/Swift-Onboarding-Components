import { FilterDateRange } from '../../../filters.types';

const useDateOptions = () => [
  { value: FilterDateRange.AllTime, label: 'All-time' },
  { value: FilterDateRange.Today, label: 'Today' },
  { value: FilterDateRange.Last7Days, label: 'Last 7 days' },
  { value: FilterDateRange.Last30Days, label: 'Last 30 days' },
  { value: FilterDateRange.Custom, label: 'Custom' },
];

export default useDateOptions;
