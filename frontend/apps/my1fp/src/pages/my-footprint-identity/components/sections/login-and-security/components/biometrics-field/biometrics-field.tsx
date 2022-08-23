import { useTranslation } from 'hooks';
import { IcoCheckCircle16 } from 'icons';
import React from 'react';
import styled from 'styled-components';
import { Typography } from 'ui';

export type BiometricsFieldProps = {
  device?: string;
};

const BiometricsField = ({ device }: BiometricsFieldProps) => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security.biometrics',
  );

  return (
    <Container>
      <IconContainer>
        <IcoCheckCircle16 color="success" />
      </IconContainer>
      <Typography variant="body-3" color="success" sx={{ marginLeft: 3 }}>
        {device ?? t('default-device')}
      </Typography>
    </Container>
  );
};

const IconContainer = styled.span`
  min-width: 16px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

export default BiometricsField;
