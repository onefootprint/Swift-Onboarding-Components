import { IcoChevronDown16 } from '@onefootprint/icons';
import {
  Box,
  DateSelectorSheet,
  SelectNew,
  Stack,
  Text,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

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

  const handleToggleDataSheet = () => {
    setIsDateSheetOpen(!isDateSheetOpen);
  };

  const handleSelectChange = (newPeriod: string) => {
    filters.push({
      ...filters.query,
      period: newPeriod as DateFilterPeriod,
      period_date_start: undefined,
      period_date_end: undefined,
    });
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
    <Stack direction="row" align="center" justify="center">
      <StyledSelectNew
        onChange={handleSelectChange}
        options={options}
        size="compact"
        value={values.period}
      />
      <Line />
      <DateSelectorSheet
        startDate={values.start}
        endDate={values.end}
        onChange={handleSheetChange}
        onOpenChange={handleToggleDataSheet}
        onClickOutside={handleToggleDataSheet}
        open={isDateSheetOpen}
        asChild
      >
        <Range onClick={handleToggleDataSheet} data-is-focus={isDateSheetOpen}>
          <Text
            color="primary"
            height="22px"
            lineHeight="22px"
            variant="body-4"
            whiteSpace="nowrap"
          >
            {getFormattedRange(values.start, values.end)}
          </Text>
          <IconContainer
            align="center"
            data-is-open={isDateSheetOpen}
            justify="center"
          >
            <IcoChevronDown16 />
          </IconContainer>
        </Range>
      </DateSelectorSheet>
    </Stack>
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
      border-radius: 0 ${input.global.borderRadius} ${input.global.borderRadius}
        0;
      border-left: 0;
      isolation: isolate;
      color: ${input.global.color};

      &[data-is-focus='true'],
      &:focus {
        background-color: ${input.state.default.focus.bg};
<<<<<<< Updated upstream

      
=======
>>>>>>> Stashed changes
      }

      &:hover {
        border-color: ${input.state.default.hover.border};
      }
    `;
  }};
`;

const StyledSelectNew = styled(SelectNew)`
  ${({ theme }) => css`
    && {
      border-radius: ${theme.borderRadius.default} 0 0
        ${theme.borderRadius.default};
      border-right: 0;
    }
  `}
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

const Line = styled(Box)`
  ${({ theme }) => css`
    width: 1px;
    height: 100%;
    background-color: ${theme.borderColor.primary};
  `}
`;

export default DateFilter;
