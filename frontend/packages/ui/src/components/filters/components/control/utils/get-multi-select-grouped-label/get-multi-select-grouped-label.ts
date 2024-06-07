import type { FilterGroupOption, FilterSelectedOption } from '../../../../filters.types';

const getMultiSelectGroupedLabel = (options: FilterGroupOption[], selectedOptions: FilterSelectedOption[]) => {
  const labels: string[] = [];
  options.forEach(group => {
    group.options.forEach(option => {
      if (selectedOptions.includes(option.value)) {
        labels.push(option.label);
      }
    });
  });
  if (labels.length > 2) {
    const [firstLabel] = labels;
    return `${firstLabel} and ${labels.length - 1} more`;
  }
  return labels.join(', ');
};

export default getMultiSelectGroupedLabel;
