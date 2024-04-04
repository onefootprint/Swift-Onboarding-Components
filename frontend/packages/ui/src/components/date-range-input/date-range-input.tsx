'use client';

import { format } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import DateSelectorSheet from '../date-selector-sheet';
import Input from '../internal/input';

export type DateRangeInputProps = {
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  placeholder?: string;
  size?: 'default' | 'compact';
  onOpenChange?: (open: boolean) => void;
  startDate?: Date;
  endDate?: Date;
};

const DateRangeInput = ({
  initialStartDate,
  initialEndDate,
  startDate,
  endDate,
  placeholder = 'Select a date range',
  onOpenChange,
  onChange,
  size,
}: DateRangeInputProps) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    initialStartDate,
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    initialEndDate,
  );
  const [openDateSheet, setOpenDateSheet] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      setSelectedStartDate(startDate);
      setSelectedEndDate(endDate);
    }
  }, [startDate, endDate]);

  const formattedRange = useMemo(
    () =>
      selectedStartDate && selectedEndDate
        ? `${format(selectedStartDate, 'MM/dd/yy')} \u2013 ${format(
            selectedEndDate,
            'MM/dd/yy',
          )}`
        : '',
    [selectedStartDate, selectedEndDate],
  );

  const handleRangeChange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    setSelectedStartDate(newStartDate);
    setSelectedEndDate(newEndDate);
    if (onChange) {
      onChange(newStartDate, newEndDate);
    }
  };

  const handleToggleDateSheet = () => {
    setOpenDateSheet(!openDateSheet);
  };

  return (
    <DateSelectorSheet
      startDate={selectedStartDate}
      endDate={selectedEndDate}
      onOpenChange={onOpenChange}
      onChange={handleRangeChange}
      onClickOutside={handleToggleDateSheet}
      open={openDateSheet}
      asChild
    >
      <Trigger
        onClick={handleToggleDateSheet}
        type="button"
        aria-label="Select Date Range"
      >
        <Input
          placeholder={placeholder}
          size={size}
          value={formattedRange}
          readOnly
        />
      </Trigger>
    </DateSelectorSheet>
  );
};

const Trigger = styled.button`
  all: unset;
`;

export default DateRangeInput;
