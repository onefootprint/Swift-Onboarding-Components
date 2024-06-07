import type { FilterOption, FilterSelectedOption } from '../../../../filters.types';

const getMultiSelectLabel = (options: FilterOption[], selectedOptions: FilterSelectedOption[]) => {
  const labels: string[] = [];
  options.forEach(option => {
    if (selectedOptions.includes(option.value)) {
      labels.push(option.label);
    }
  });
  if (labels.length > 2) {
    const [firstLabel] = labels;
    return `${firstLabel} and ${labels.length - 1} more`;
  }
  return labels.join(', ');
};

export default getMultiSelectLabel;
