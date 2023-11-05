import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Radio, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import useSandboxOutcomeOptions from '../../../../hooks/use-sandbox-outcome-options';

type RealOutcomeProps = {
  onSelect: () => void;
  isSelected: boolean;
};

const RealOutcome = ({ onSelect, isSelected }: RealOutcomeProps) => {
  const { t } = useTranslation('pages.sandbox-outcome.id-doc-outcome');
  const {
    idDocOutcomeOptions: { idDocOutcomeReal },
  } = useSandboxOutcomeOptions();
  const { control, setValue } = useFormContext();

  const handleChange = () => {
    onSelect();
    if (!isSelected) setValue('outcomes.idDocOutcome', idDocOutcomeReal);
  };

  return (
    <Container>
      <Controller
        control={control}
        name="outcomes.idDocOutcome"
        render={() => (
          <Radio
            label={idDocOutcomeReal.label}
            value={idDocOutcomeReal.value}
            onChange={handleChange}
            checked={isSelected}
          />
        )}
      />
      <Tooltip
        text={t('real-outcome.description')}
        alignment="start"
        position="top"
      >
        <IcoInfo16 />
      </Tooltip>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
  `}
`;

export default RealOutcome;
