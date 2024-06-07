import { IcoArrowRightSmall16, IcoWarning16 } from '@onefootprint/icons';
import { endOfDay, isAfter, isBefore, startOfDay, startOfToday } from 'date-fns';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Portal from '../../../portal';
import Stack from '../../../stack';
import Text from '../../../text';
import DateInput from '../date-input';

export type RangeInputsProps = {
  startDate?: Date;
  endDate?: Date;
  onFocus?: (trigger: 'start' | 'end') => void;
  disableFutureDates?: boolean;
  disablePastDates?: boolean;
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
  disableFutureDates = false,
  disablePastDates = false,
  onChange,
  onFocus,
}: RangeInputsProps) => {
  const { t } = useTranslation('ui');
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);

  const handleFocus = (trigger: 'start' | 'end') => () => {
    onFocus?.(trigger);
  };

  const handleStartChanged = (newStartDate: Date) => {
    if (disableFutureDates && isAfter(newStartDate, endOfDay(startOfToday()))) {
      setStartError(true);
    } else if (disablePastDates && isBefore(newStartDate, startOfDay(startOfToday()))) {
      setStartError(true);
    } else {
      setStartError(false);
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
    }
  };

  const handleEndChanged = (newEndDate: Date) => {
    if (disableFutureDates && isAfter(newEndDate, endOfDay(startOfToday()))) {
      setEndError(true);
    } else if (disablePastDates && isBefore(newEndDate, startOfDay(startOfToday()))) {
      setEndError(true);
    } else {
      setEndError(false);
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
    }
  };

  return (
    <>
      <Container backgroundColor="secondary" direction="column" padding={4} gap={3}>
        <Stack gap={3} center>
          <DateInput
            autoFocus
            onChange={handleStartChanged}
            onFocus={handleFocus('start')}
            value={startDate}
            hasError={startError}
          />
          <Stack center>
            <IcoArrowRightSmall16 />
          </Stack>
          <DateInput onChange={handleEndChanged} onFocus={handleFocus('end')} value={endDate} hasError={endError} />
        </Stack>
      </Container>
      <Portal selector="#error-message">
        {endError || startError ? (
          <ErrorMessage>
            <IcoWarning16 color="error" />
            <Text variant="body-4" color="error">
              {disableFutureDates ? t('components.date-range.error-past') : t('components.date-range.error-future')}
            </Text>
          </ErrorMessage>
        ) : null}
      </Portal>
    </>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const ErrorMessage = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.error};
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default RangeInputs;
