import type { FilterOption, FilterSelectedOption } from '../../../../filters.types';

const isValidDate = (possibleDate: string) => {
  const date = Date.parse(possibleDate);
  return !Number.isNaN(date);
};

// TODO: Add formatjs
// https://linear.app/footprint/issue/FP-2300/spike-formatjs
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-us', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date);

const getDateLabel = (options: FilterOption[], selectedOptions: FilterSelectedOption[]) => {
  const isRange = selectedOptions.length === 2;
  if (isRange) {
    const [from, to] = selectedOptions;
    if (isValidDate(from) && isValidDate(to)) {
      const fromAsDate = new Date(from);
      const toAsDate = new Date(to);
      return `${formatDate(fromAsDate)} - ${formatDate(toAsDate)}`;
    }
  }
  const [firstValue] = selectedOptions;
  return options.find(option => option.value === firstValue)?.label;
};

export default getDateLabel;
