import { useTranslation } from '@onefootprint/hooks';
import { IcoClose16 } from '@onefootprint/icons';
import { InsightEvent } from '@onefootprint/types';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';
import { Box, LoadingIndicator, Typography } from 'ui';

import useGetLiveness, {
  GetLivenessResponse,
} from '../../hooks/use-get-liveness/use-get-liveness';
import BiometricsField from '../biometrics-field/biometrics-field';
import VerifyBiometrics from '../verify-biometrics';

const UserBiometricsInfo = () => {
  const { session, updateBiometric } = useSessionUser();
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security.biometrics',
  );

  const handleLivenessQuerySuccess = (data: GetLivenessResponse) => {
    if (data?.length) {
      updateBiometric(data);
    }
  };

  const livenessQuery = useGetLiveness({
    onSuccess: handleLivenessQuerySuccess,
  });

  if (!session) {
    return null;
  }
  const { biometric } = session;
  const label = (
    <Typography variant="label-3" color="tertiary">
      {t('label')}
    </Typography>
  );

  if (livenessQuery.isLoading && !biometric.length) {
    return (
      <Box>
        {label}
        <LoadingContainer>
          <LoadingIndicator />
        </LoadingContainer>
      </Box>
    );
  }

  if (biometric.length > 0) {
    return (
      <Box>
        {label}
        {biometric.map((b: InsightEvent) => (
          <BiometricsField device={b.userAgent} key={b.timestamp} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {label}
      <Container>
        <LabelContainer>
          <IcoClose16 color="error" />
          <Typography variant="body-3" color="error" sx={{ marginLeft: 3 }}>
            {t('not-verified')}
          </Typography>
        </LabelContainer>
        <VerifyBiometrics />
      </Container>
    </Box>
  );
};

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default UserBiometricsInfo;
