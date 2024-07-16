import type { OverallOutcome } from '@onefootprint/types';
import { Box, Select, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

import useSandboxOutcomeOptions from '../../hooks/use-sandbox-outcome-options';

const OverallOutcomeSelect = () => {
  const { t } = useTranslation('pages.sandbox-outcome.overall-outcome');
  const {
    overallOutcomeOptions: { overallOutcomeSuccess, overallOutcomeFail, overallOutcomeManualReview },
  } = useSandboxOutcomeOptions();
  const { control } = useFormContext();

  const options = [overallOutcomeSuccess, overallOutcomeFail, overallOutcomeManualReview];

  const hasValueInOptions = (value: OverallOutcome) => options.some(option => option.value === value);

  return (
    <OverallOutcomeContainer>
      <Typography variant="label-2">{t('title')}</Typography>
      <Controller
        control={control}
        name="outcomes.overallOutcome"
        render={({ field }) => (
          <Box>
            <Select
              options={options}
              value={hasValueInOptions(field.value.value) ? field.value : null}
              onChange={field.onChange}
              placeholder="-"
            />
          </Box>
        )}
      />
    </OverallOutcomeContainer>
  );
};

const OverallOutcomeContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default OverallOutcomeSelect;
