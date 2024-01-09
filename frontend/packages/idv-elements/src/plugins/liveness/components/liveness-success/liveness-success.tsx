import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const LivenessSuccess = () => {
  const { t } = useTranslation('liveness.components.liveness-success');

  return (
    <IconContainer>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {t('label')}
      </Typography>
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
