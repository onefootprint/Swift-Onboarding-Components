import { isEqual, isValid, set } from 'date-fns';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils';
import Stack from '../../../stack';
import Text from '../../../text';

type DateInputProps = {
  autoFocus?: boolean;
  value: Date;
  hasError?: boolean;
  onChange: (date: Date) => void;
  onFocus: () => void;
};

const DateInput = ({ autoFocus, value, hasError, onChange, onFocus }: DateInputProps) => {
  const [focused, setFocused] = useState(false);
  const [month, setMonth] = useState(() => (value.getMonth() + 1).toString().padStart(2, '0'));
  const [day, setDay] = useState(() => value.getDate().toString().padStart(2, '0'));
  const [year, setYear] = useState(value.getFullYear().toString());

  useEffect(() => {
    setMonth((value.getMonth() + 1).toString().padStart(2, '0'));
    setDay(value.getDate().toString().padStart(2, '0'));
    setYear(value.getFullYear().toString());
  }, [value]);

  const submit = () => {
    const newDate = set(value, {
      year: parseInt(year, 10),
      month: parseInt(month, 10) - 1,
      date: parseInt(day, 10),
    });

    if (!isValid(newDate)) {
      setMonth((value.getMonth() + 1).toString().padStart(2, '0'));
      setDay(value.getDate().toString().padStart(2, '0'));
      setYear(value.getFullYear().toString());
    }

    if (!isEqual(newDate, value)) {
      onChange(newDate);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
    setFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setFocused(false);
    submit();
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let monthValue = parseInt(event.target.value, 10);
    monthValue = Math.max(1, Math.min(12, monthValue));
    setMonth(monthValue.toString().padStart(2, '0'));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let dateValue = parseInt(event.target.value, 10);
    dateValue = Math.max(1, Math.min(31, dateValue));
    setDay(dateValue.toString().padStart(2, '0'));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(event.target.value, 10);
    if (yearValue > 0) {
      setYear(yearValue.toString());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      submit();
    }
  };

  return (
    <Container data-focused={focused} data-error={hasError}>
      <Month
        autoFocus={autoFocus}
        maxLength={2}
        onBlur={handleBlur}
        onChange={handleMonthChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        type="number"
        value={month}
      />
      <Text color="tertiary" variant="body-4">
        /
      </Text>
      <Day
        maxLength={2}
        onBlur={handleBlur}
        onChange={handleDateChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        type="number"
        value={day}
      />
      <Text color="tertiary" variant="body-4">
        /
      </Text>
      <Year
        maxLength={4}
        onBlur={handleBlur}
        onChange={handleYearChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        type="number"
        value={year}
      />
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => {
    const { input } = theme.components;

    return css`
      align-items: center;
      background: #fff;
      border-radius: ${theme.borderRadius.default};
      border: 1px solid ${theme.borderColor.primary};
      height: 32px;
      justify-content: center;
      width: 128px;

      &[data-focused='true'] {
        background: ${input.state.default.focus.bg};
        border-color: ${input.state.default.focus.border};
        box-shadow: ${input.state.default.focus.elevation};
      }

      &[data-error='true'] {
        border-color: ${theme.borderColor.error};
        box-shadow: ${input.state.error.focus.elevation};
        background: ${input.state.error.focus.bg};
      }
    `;
  }}
`;

const Input = styled.input`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    border: none;
    color: ${theme.color.primary};
    height: $ ${theme.spacing[6]};
    outline: none;
    text-align: center;
  `}
`;

const Month = styled(Input)`
  width: 24px;
`;

const Day = styled(Input)`
  width: 24px;
`;

const Year = styled(Input)`
  width: 44px;
`;

export default DateInput;
