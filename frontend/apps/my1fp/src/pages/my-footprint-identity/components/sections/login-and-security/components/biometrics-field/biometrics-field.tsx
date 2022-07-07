import { useTranslation } from 'hooks';
import IcoCheckCircle16 from 'icons/ico/ico-check-circle-16';
import IcoClose16 from 'icons/ico/ico-close-16';
import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from 'ui';

export type BiometricsFieldProps = {
  verified?: boolean;
  device?: string;
};

const BiometricsField = ({ verified, device }: BiometricsFieldProps) => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security.biometrics',
  );

  return (
    <Box>
      <Typography variant="label-3" color="tertiary">
        {t('label')}
      </Typography>
      <VerifiedStatusContainer>
        {verified ? (
          <>
            <IcoCheckCircle16 color="success" />
            <Typography variant="body-3" color="success" sx={{ marginLeft: 3 }}>
              {device ?? 'Mobile'}
            </Typography>
          </>
        ) : (
          <>
            <IcoClose16 color="error" />
            <Typography variant="body-3" color="error" sx={{ marginLeft: 3 }}>
              {t('not-verified')}
            </Typography>
          </>
        )}
      </VerifiedStatusContainer>
    </Box>
  );
};

const VerifiedStatusContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default BiometricsField;
