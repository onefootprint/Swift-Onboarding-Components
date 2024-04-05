import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

import Stack from '../../../stack';
import DateInput from '../date-input';

export type RangeInputsProps = {
  startDate?: Date;
  endDate?: Date;
  onFocus?: (trigger: 'start' | 'end') => void;
  onChange: ({
    startDate,
    endDate,
    trigger,
  }: {
    startDate?: Date;
    endDate?: Date;
    trigger: 'start' | 'end';
  }) => void;
};

const RangeInputs = ({
  startDate = new Date(),
  endDate = new Date(),
  onChange,
  onFocus,
}: RangeInputsProps) => {
  const handleFocus = (trigger: 'start' | 'end') => () => {
    onFocus?.(trigger);
  };

  const handleStartChanged = (newStartDate: Date) => {
    if (newStartDate > endDate) {
      onChange({
        startDate: endDate,
        endDate: newStartDate,
        trigger: 'start',
      });
    } else {
      onChange({
        startDate: newStartDate,
        endDate,
        trigger: 'start',
      });
    }
  };

  const handleEndChanged = (newEndDate: Date) => {
    if (newEndDate < startDate) {
      onChange({
        startDate: newEndDate,
        endDate: startDate,
        trigger: 'end',
      });
    } else {
      onChange({
        startDate,
        endDate: newEndDate,
        trigger: 'end',
      });
    }
  };

  return (
    <Container
      backgroundColor="secondary"
      direction="column"
      padding={4}
      marginBottom={3}
      gap={3}
    >
      <Stack gap={3} center>
        <DateInput
          autoFocus
          onChange={handleStartChanged}
          onFocus={handleFocus('start')}
          value={startDate}
        />
        <Stack center>
          <IcoArrowRightSmall16 />
        </Stack>
        <DateInput
          onChange={handleEndChanged}
          onFocus={handleFocus('end')}
          value={endDate}
        />
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default RangeInputs;
