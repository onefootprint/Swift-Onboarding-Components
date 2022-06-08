import type { SelectOption } from './select.types';

export const filterValues = (
  options: SelectOption[],
  search: string | null,
) => {
  if (!search) return options;
  const searchLowerCased = search.toLowerCase();
  return options.filter(
    ({ value, label }) =>
      value.toString().toLowerCase().includes(searchLowerCased) ||
      label.toLowerCase().includes(searchLowerCased),
  );
};

export const getItem = (
  options: SelectOption[],
  value?: string | number | null,
) => {
  if (!value) return null;
  return options.find(option => option.value === value);
};
