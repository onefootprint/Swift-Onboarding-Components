import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocOutcomes } from '@onefootprint/types';
import { Radio, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type RealOutcomeProps = {
  onSelect: () => void;
  isSelected: boolean;
};

const RealOutcome = ({ onSelect, isSelected }: RealOutcomeProps) => {
  const { t } = useTranslation('pages.sandbox-outcome.id-doc-outcome');
  const { control } = useFormContext();

  return (
    <Container>
      <Controller
        control={control}
        name="outcomes.idDocOutcome"
        render={({ field }) => (
          <Radio
            label={t('real-outcome.title')}
            value={IdDocOutcomes.real}
            onChange={ev => {
              onSelect();
              field.onChange(ev);
            }}
            checked={isSelected}
          />
        )}
      />
      <Typography
        variant="body-3"
        color="tertiary"
        sx={{ marginLeft: 7, paddingLeft: 2 }}
      >
        {t('real-outcome.description')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

export default RealOutcome;
