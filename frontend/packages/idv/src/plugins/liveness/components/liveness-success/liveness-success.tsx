import { Text } from '@onefootprint/ui';
import AnimatedSuccessCheck from '@onefootprint/ui/src/components/animated-success-check';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const LivenessSuccess = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'liveness.components.liveness-success',
  });

  return (
    <IconContainer>
      <AnimatedSuccessCheck animationStart />
      <Text variant="label-3" color="success" marginTop={5}>
        {t('label')}
      </Text>
    </IconContainer>
  );
};

const IconContainer = styled.form`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: ${theme.spacing[8]};
    gap: ${theme.spacing[2]};
  `}
`;

export default LivenessSuccess;
