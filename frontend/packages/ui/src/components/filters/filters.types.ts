export type FilterOption = {
  label: string;
  value: string;
};

export type FilterSelectedOption = FilterOption['value'];

export type FilterGroupOption = {
  label: string;
  options: FilterOption[];
};

export type FilterSingleSelect = {
  kind: 'single-select';
  options: FilterOption[];
  selectedOptions: FilterSelectedOption | undefined;
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
  disabled?: boolean;
  loading?: boolean;
  query: string;
  label: string;
} & (FilterSingleSelect | FilterMultiSelect | FilterMultiSelectGrouped | FilterDate);

export enum FilterDateRange {
  AllTime = 'all-time',
  Today = 'today',
  Last7Days = 'last-7-days',
  Last30Days = 'last-30-days',
  Custom = 'custom',
}
