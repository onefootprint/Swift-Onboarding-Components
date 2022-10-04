import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

import Box from '../box';
import ButtonPicker, { ButtonPickerRef } from './components/button-picker';

export type InputDateRangePickerProps = {
  onChange?: (start: Date, end: Date) => void;
  startDate: Date;
  endDate: Date;
};

const InputDateRangePicker = ({
  startDate,
  endDate,
  onChange,
}: InputDateRangePickerProps) => {
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
    <Box>
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
    </Box>
  );
};

const InputContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    border-radius: ${theme.borderRadius[2]}px;
    border: 1px solid ${theme.borderColor.primary};
    display: inline-flex;
    gap: ${theme.spacing[4]}px;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `};
`;

export default InputDateRangePicker;
