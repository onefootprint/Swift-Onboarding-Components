import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import RealOutcome from './components/real-outcome';
import SimulatedOutcomes from './components/simulated-outcomes';

type IdDocOutcomeSelectProps = {
  allowRealOutcome?: boolean;
};

const IdDocOutcomeSelect = ({ allowRealOutcome }: IdDocOutcomeSelectProps) => {
  const { t } = useTranslation('pages.sandbox-outcome.id-doc-outcome');
  const [isSimulated, setIsSimulated] = useState(true);

  const outcomeTypeChange = () => {
    setIsSimulated(prev => !prev);
  };

  return (
    <Container>
      <Typography variant="label-2">{t('title')}</Typography>
      <OutcomesContainer>
        {allowRealOutcome && (
          <RealOutcome onSelect={outcomeTypeChange} isSelected={!isSimulated} />
        )}
        <SimulatedOutcomes
          onSelect={outcomeTypeChange}
          isSelected={isSimulated}
          allowRealOutcome={allowRealOutcome}
        />
      </OutcomesContainer>
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

const OutcomesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default IdDocOutcomeSelect;
