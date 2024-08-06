import { Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import RealOutcome from './components/real-outcome';
import SimulatedOutcomes from './components/simulated-outcomes';

type IdDocOutcomeSelectProps = {
  allowRealOutcome?: boolean;
};

const IdDocOutcomeSelect = ({ allowRealOutcome }: IdDocOutcomeSelectProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome.id-doc-outcome',
  });
  const [isSimulated, setIsSimulated] = useState(true);

  const outcomeTypeChange = () => {
    setIsSimulated(prev => !prev);
  };

  return (
    <Container>
      <Text variant="label-2">{t('title')}</Text>
      <OutcomesContainer>
        {allowRealOutcome && <RealOutcome onSelect={outcomeTypeChange} isSelected={!isSimulated} />}
        <SimulatedOutcomes onSelect={outcomeTypeChange} isSelected={isSimulated} allowRealOutcome={allowRealOutcome} />
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
