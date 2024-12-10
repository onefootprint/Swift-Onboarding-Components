import { IcoChevronDown16 } from '@onefootprint/icons';
import { DateSelectorSheet, SelectCustom } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import useFilters from '../../hooks/use-filters';
import type { DateFilterPeriod } from './date-filter.types';
import useOptions from './hooks/use-options';
import useValues from './hooks/use-values';
import getFormattedRange from './utils/get-formatted-range';

const DateFilter = () => {
  const filters = useFilters();
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);

  const options = useOptions();
  const values = useValues();
  const selectedOption = options.find(option => option.value === values.period);

  const handleToggleDataSheet = () => {
    setIsDateSheetOpen(!isDateSheetOpen);
  };

  const handleSelectChange = (newPeriod: string) => {
    if (newPeriod === 'custom') {
      setIsDateSheetOpen(true);
      filters.push({
        period: newPeriod as DateFilterPeriod,
        period_date_start: filters.values.period_date_start?.toISOString(),
        period_date_end: filters.values.period_date_end?.toISOString(),
      });
    } else {
      filters.push({
        ...filters.query,
        period: newPeriod as DateFilterPeriod,
        period_date_start: undefined,
        period_date_end: undefined,
      });
    }
  };

  const handleSheetChange = ({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    filters.push({
      ...filters.query,
      period: 'custom',
      period_date_start: startDate?.toISOString(),
      period_date_end: endDate?.toISOString(),
    });
  };

  return (
    <div className="flex items-center justify-center">
      <SelectCustom.Root value={values.period} onValueChange={handleSelectChange}>
        <SelectCustom.Trigger
          className={cx(
            'border border-solid border-primary h-8 px-2 py-2 bg-primary rounded-l rounded-r-none border-r-0 w-full hover:border-gray-300',
            {
              'border-gray-300': isDateSheetOpen,
            },
          )}
        >
          <SelectCustom.Value placeholder="Select">{selectedOption?.label}</SelectCustom.Value>
          <SelectCustom.ChevronIcon />
        </SelectCustom.Trigger>
        <SelectCustom.Content popper align="start" minWidth="200px">
          <SelectCustom.Group>
            {options.map(option => {
              return (
                <SelectCustom.Item key={option.value} value={option.value}>
                  {option.label}
                </SelectCustom.Item>
              );
            })}
          </SelectCustom.Group>
        </SelectCustom.Content>
      </SelectCustom.Root>
      <div className="w-px h-full bg-primary" />
      <DateSelectorSheet
        startDate={values.start}
        endDate={values.end}
        onChange={handleSheetChange}
        onClickOutside={handleToggleDataSheet}
        open={isDateSheetOpen}
        disableFutureDates
        asChild
      >
        <button
          onClick={handleToggleDataSheet}
          type="button"
          className={cx(
            'flex items-center gap-1 h-8 px-2 py-2 bg-primary border border-solid border-primary hover:border-gray-300 rounded-r cursor-pointer text-input-color',
            {
              'border-gray-300': isDateSheetOpen,
            },
          )}
        >
          <span className="text-body-3 whitespace-nowrap min-w-[190px] text-center leading-[22px]">
            {getFormattedRange(values.start, values.end)}
          </span>
          <div
            className={cx('flex items-center justify-center text-primary transition-transform duration-100 ease-in', {
              'rotate-180': isDateSheetOpen,
            })}
          >
            <IcoChevronDown16 />
          </div>
        </button>
      </DateSelectorSheet>
    </div>
  );
};

export default DateFilter;
