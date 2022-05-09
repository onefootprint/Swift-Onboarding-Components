import type { SelectOption } from './select.types';

const filterValues = (options: SelectOption[], search: string | null) => {
  if (!search) return options;
  const searchLowerCased = search.toLowerCase();
  return options.filter(
    ({ value, label }) =>
      value.toString().toLowerCase().includes(searchLowerCased) ||
      label.toLowerCase().includes(searchLowerCased),
  );
};

export default filterValues;
