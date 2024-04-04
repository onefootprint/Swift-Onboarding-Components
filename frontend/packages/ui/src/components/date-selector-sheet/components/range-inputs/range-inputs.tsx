import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { format } from 'date-fns';
import type { ChangeEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils';
import InternalInput from '../../../internal/input';
import Stack from '../../../stack';
import type { RangeInputsProps } from '../../date-selector-sheet.types';
import { DateType } from '../../date-selector-sheet.types';

const RangeInputs = ({
  startDate,
  endDate,
  onRangeChange,
}: RangeInputsProps) => {
  const [internalStartDate, setInternalStartDate] = useState(startDate);
  const [internalEndDate, setInternalEndDate] = useState(endDate);
  const [invalidDateRange, setInvalidDateRange] = useState(false);

  const startDateRef = useRef(startDate);
  const endDateRef = useRef(endDate);
  useEffect(() => {
    if (startDate !== startDateRef.current || endDate !== endDateRef.current) {
      setInternalStartDate(startDate);
      setInternalEndDate(endDate);
      startDateRef.current = startDate;
      endDateRef.current = endDate;
      setInvalidDateRange(false);
    }
  }, [startDate, endDate]);

  const handleDateChange =
    (dateType: DateType) => (e: ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value;
      const dateParts = dateValue.split('/');
      if (
        dateParts.length === 3 &&
        dateParts[0].length === 2 &&
        dateParts[1].length === 2 &&
        dateParts[2].length === 4
      ) {
        const [month, day, year] = dateParts.map(Number);
        const newDate = new Date(year, month - 1, day);

        if (dateType === DateType.start) {
          setInternalStartDate(newDate);
          if (!invalidDateRange) {
            onRangeChange(newDate, internalEndDate);
          }
          startDateRef.current = newDate;
        } else {
          setInternalEndDate(newDate);
          if (!invalidDateRange) {
            onRangeChange(internalStartDate, newDate);
          }
          endDateRef.current = newDate;
        }
      }
    };

  return (
    <Container
      backgroundColor="secondary"
      direction="column"
      padding={5}
      marginBottom={4}
      gap={3}
    >
      <Stack gap={3} align="center" justify="center">
        <DateInputContainer
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={
            internalStartDate ? format(internalStartDate, 'MM/dd/yyyy') : ''
          }
          onChange={handleDateChange(DateType.start)}
          mask={{
            date: true,
            datePattern: ['m', 'd', 'Y'],
            delimiter: '/',
            blocks: [2, 2, 4],
          }}
          sx={{
            letterSpacing: '0.02em',
          }}
        />
        <Stack align="center" justify="center">
          <IcoArrowRightSmall16 color="tertiary" />
        </Stack>
        <DateInputContainer
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={internalEndDate ? format(internalEndDate, 'MM/dd/yyyy') : ''}
          onChange={handleDateChange(DateType.end)}
          hasError={invalidDateRange}
          mask={{
            date: true,
            datePattern: ['m', 'd', 'Y'],
            delimiter: '/',
            blocks: [2, 2, 4],
          }}
          sx={{
            letterSpacing: '0.02em',
          }}
        />
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => `
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    input {
        width: 100%;
    }
  `}
`;

const DateInputContainer = styled(InternalInput)`
  ${({ theme }) => css`
    width: 100%;
    padding: ${theme.spacing[3]};
    ${createFontStyles('body-4')};
    background-color: ${theme.backgroundColor.primary};
    width: fit-content;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default RangeInputs;
