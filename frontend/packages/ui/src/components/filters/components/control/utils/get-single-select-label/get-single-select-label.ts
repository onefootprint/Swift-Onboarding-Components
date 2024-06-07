import type { FilterOption, FilterSelectedOption } from '../../../../filters.types';

const getSingleSelectLabel = (options: FilterOption[], selectedOption: FilterSelectedOption) => {
  const selected = options.find(option => selectedOption === option.value);
  return selected ? selected.label : '';
};

export default getSingleSelectLabel;
