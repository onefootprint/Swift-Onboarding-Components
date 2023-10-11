import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocOutcomes } from '@onefootprint/types';
import { Box, Radio } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import OutcomeSelect from '../../../outcome-select';

type SimulatedOutcomesProps = {
  onSelect: () => void;
  isSelected: boolean;
  allowRealOutcome?: boolean;
};

const SimulatedOutcomes = ({
  onSelect,
  isSelected,
  allowRealOutcome,
}: SimulatedOutcomesProps) => {
  const { t } = useTranslation('pages.sandbox-outcome.id-doc-outcome');
  const { control } = useFormContext();

  return (
    <Container>
      {allowRealOutcome && (
        <Controller
          control={control}
          name="outcomes.idDocOutcome"
          render={({ field }) => (
            <Radio
              label={t('simulated-outcome.title')}
              value="simulated"
              onChange={() => {
                onSelect();
                field.onChange(IdDocOutcomes.success);
              }}
              checked={isSelected}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name="outcomes.idDocOutcome"
        render={({ field }) => (
          <Box marginLeft={allowRealOutcome ? 7 : 0} paddingLeft={2}>
            <OutcomeSelect
              options={[
                {
                  title: t('simulated-outcome.options.success.title'),
                  value: IdDocOutcomes.success,
                },
                {
                  title: t('simulated-outcome.options.fail.title'),
                  value: IdDocOutcomes.fail,
                },
              ]}
              disabled={!isSelected}
              value={field.value}
              onChange={field.onChange}
              testID="simulatedOutcomeOptions"
            />
          </Box>
        )}
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default SimulatedOutcomes;
