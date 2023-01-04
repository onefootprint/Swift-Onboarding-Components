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

export type FilterControl = {
  query: string;
  label: string;
} & (FilterMultiSelect | FilterMultiSelectGrouped);
