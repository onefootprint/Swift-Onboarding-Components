import { SuccessCheck, Text } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';

type SuccessProps = {
  onComplete?: () => void;
};

const Success = ({ onComplete }: SuccessProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.success',
  });

  useEffect(() => {
    // This conditional should satisfy only when we are done with the flow
    if (onComplete) {
      setTimeout(onComplete, TRANSITION_DELAY_DEFAULT);
    }
  }, [onComplete]);

  return (
    <Container>
      <SuccessCheck animationStart />
      <Text variant="label-1" textAlign="center" marginTop={5} color="success">
        {t('title')}
      </Text>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Success;
