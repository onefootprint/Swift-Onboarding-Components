import { IcoCheck24 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';

type SuccessProps = {
  onComplete?: () => void;
};

const Success = ({ onComplete }: SuccessProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.components.success',
  });

  useEffect(() => {
    // This conditional should satisfy only when we are done with the flow
    if (onComplete) {
      setTimeout(onComplete, TRANSITION_DELAY_DEFAULT);
    }
  }, [onComplete]);

  return (
    <Container>
      <SuccessIconContainer>
        <IcoCheck24 color="quinary" />
      </SuccessIconContainer>
      <Typography
        variant="label-1"
        sx={{ textAlign: 'center', marginTop: 5 }}
        color="success"
      >
        {t('title')}
      </Typography>
    </Container>
  );
};

const SuccessIconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${theme.spacing[9]};
    height: ${theme.spacing[9]};
    background-color: ${theme.backgroundColor.successInverted};
    border-radius: ${theme.borderRadius.full};
  `}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Success;
