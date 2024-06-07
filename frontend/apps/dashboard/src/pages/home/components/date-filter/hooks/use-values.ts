import useFilters from '../../../hooks/use-filters';
import { DEFAULT_DATE_FILTER_PERIOD } from '../date-filter.types';
import useOptions from './use-options';

const useValues = () => {
  const filters = useFilters();
  const options = useOptions();
  const isValidPeriod = options.some(({ value }) => value === filters.values.period);

  const period = isValidPeriod ? filters.values.period : DEFAULT_DATE_FILTER_PERIOD;

  return {
    period,
    start: filters.values.period_date_start,
    end: filters.values.period_date_end,
  };
};

export default useValues;
