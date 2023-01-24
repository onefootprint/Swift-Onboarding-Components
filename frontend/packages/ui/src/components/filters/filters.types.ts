export type FilterOption = {
  label: string;
  value: string;
};

export type FilterSelectedOption = FilterOption['value'];

export type FilterGroupOption = {
  label: string;
  options: FilterOption[];
};

export type FilterMultiSelect = {
  kind: 'multi-select';
  options: FilterOption[];
  selectedOptions: FilterSelectedOption[];
};

export type FilterMultiSelectGrouped = {
  kind: 'multi-select-grouped';
  options: FilterGroupOption[];
  selectedOptions: FilterSelectedOption[];
};

export type FilterDate = {
  kind: 'date';
  options?: FilterOption[];
  selectedOptions: FilterSelectedOption[];
};

export type FilterControl = {
  loading?: boolean;
  query: string;
  label: string;
} & (FilterMultiSelect | FilterMultiSelectGrouped | FilterDate);

export enum FilterDateRange {
  AllTime = 'all-time',
  Today = 'today',
  Last7Days = 'last-7-days',
  Last30Days = 'last-30-days',
  Custom = 'custom',
}
