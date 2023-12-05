import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import IllustrationContainer from '../illustration-container';
import Event from './components/event';

const translations = ['ios', 'mac', 'collected'];

const SecurityLogs = () => {
  const { t } = useTranslation(
    'pages.auth.endless-benefits.elements.security-logs',
  );
  return (
    <StyledIllustrationContainer>
      <Background />
      <Events direction="column" gap={9}>
        {translations.map(translation => (
          <Event text={t(`logs.${translation}`)} key={translation} />
        ))}
      </Events>
    </StyledIllustrationContainer>
  );
};

const Events = styled(Stack)`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[10]};
    left: ${theme.spacing[9]};
  `}
`;

const Background = styled.div`
  background-image: url('/auth/grid/topography.svg');
  background-repeat: repeat;
  background-position: center;
  background-size: 320px;
  width: 100%;
  height: 100%;
  position: absolute;
  mask: radial-gradient(
    100% 100% at 80% 50%,
    rgba(0, 0, 0, 0.2) 0%,
    transparent 100%
  );
`;

const StyledIllustrationContainer = styled(IllustrationContainer)`
  mask: radial-gradient(100% 100% at 20% 50%, black 0%, transparent 80%);
  mask-mode: alpha;
`;

export default SecurityLogs;
