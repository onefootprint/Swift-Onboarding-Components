import { IcoChevronDown16 } from '@onefootprint/icons';
import { DateSelectorSheet, Stack, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import type { DateFilterRange } from '../../backtesting-dialog.types';
import DEFAULT_DATE_RANGE from './utils/get-default-date-range';
import getFormattedRange from './utils/get-formatted-range';

export type DateFilterProps = {
  dateRange: DateFilterRange;
  onChange: (range: DateFilterRange) => void;
};

const DateFilter = ({ dateRange, onChange }: DateFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleToggleDataSheet = () => {
    setOpen(!open);
  };

  const handleChange = ({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    if (startDate && endDate) {
      onChange({ startDate, endDate });
    } else {
      onChange(DEFAULT_DATE_RANGE);
    }
  };

  return (
    <DateSelectorSheet
      startDate={dateRange.startDate}
      endDate={dateRange.endDate}
      onChange={handleChange}
      onOpenChange={handleToggleDataSheet}
      onClickOutside={handleToggleDataSheet}
      open={open}
      alignment="end"
      disableFutureDates
      asChild
    >
      <Range onClick={handleToggleDataSheet} data-is-focus={open}>
        <Text
          color="primary"
          height="22px"
          lineHeight="22px"
          variant="body-4"
          whiteSpace="nowrap"
          minWidth="fit-content"
          textAlign="center"
        >
          {getFormattedRange(dateRange)}
        </Text>
        <IconContainer align="center" data-is-open={open} justify="center">
          <IcoChevronDown16 />
        </IconContainer>
      </Range>
    </DateSelectorSheet>
  );
};

const Range = styled.button`
  ${({ theme }) => {
    const { input } = theme.components;
    return css`
      all: unset;
      display: flex;
      align-items: center;
      position: relative;
      gap: ${theme.spacing[2]};
      padding: ${theme.spacing[2]} ${theme.spacing[3]};
      background-color: ${input.state.default.initial.bg};
      border: ${input.global.borderWidth} solid
        ${input.state.default.initial.border};
      cursor: pointer;
      border-radius: ${input.global.borderRadius};
      isolation: isolate;
      color: ${input.global.color};

      &[data-is-focus='true'],
      &:focus {
        background-color: ${input.state.default.focus.bg};
      }

      &:hover {
        border-color: ${input.state.default.hover.border};
      }
    `;
  }};
`;

const IconContainer = styled(Stack)`
  ${({ theme }) => css`
    transition: transform 0.1s ease;
    color: ${theme.color.primary};

    &[data-is-open='true'] {
      transform: rotate(180deg);
    }
  `}
`;

export default DateFilter;
