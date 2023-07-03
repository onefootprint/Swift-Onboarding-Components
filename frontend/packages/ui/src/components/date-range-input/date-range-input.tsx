import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { useRef } from 'react';

import ButtonPicker, { ButtonPickerRef } from './components/button-picker';

export type DateRangeInputProps = {
  onChange?: (start: Date, end: Date) => void;
  startDate: Date;
  endDate: Date;
};

const DateRangeInput = ({
  startDate,
  endDate,
  onChange,
}: DateRangeInputProps) => {
  const endButtonPickerRef = useRef<ButtonPickerRef>(null);

  const opeEndDatePicker = () => {
    endButtonPickerRef.current?.open();
  };

  const handleStartDateChange = (nextStartDate: Date) => {
    if (onChange) {
      const isStartGreaterThanEnd = nextStartDate > endDate;
      onChange(nextStartDate, isStartGreaterThanEnd ? nextStartDate : endDate);
    }
    opeEndDatePicker();
  };

  const handleEndDateChange = (nextEndDate: Date) => {
    onChange?.(startDate, nextEndDate);
  };

  return (
    <InputContainer>
      <ButtonPicker onChange={handleStartDateChange} value={startDate} />
      <IcoArrowRightSmall16 />
      <ButtonPicker
        disabledDays={[{ before: startDate }]}
        onChange={handleEndDateChange}
        ref={endButtonPickerRef}
        value={endDate}
      />
    </InputContainer>
  );
};

const InputContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    display: inline-flex;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

export default DateRangeInput;
