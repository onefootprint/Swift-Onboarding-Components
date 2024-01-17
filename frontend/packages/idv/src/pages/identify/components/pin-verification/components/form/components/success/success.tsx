import { IcoCheckCircle40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Success = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.components.pin-verification',
  });

  return (
    <Container>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {t('success')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    gap: ${theme.spacing[4]};
  `}
`;

export default Success;
