import useTranslation from 'hooks/src/use-translation/use-translation';
import IcoClose16 from 'icons/ico/ico-close-16';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';
import { Box, Typography } from 'ui';

import { InsightEvent } from '../../../access-logs/types';
import BiometricsField from '../biometrics-field/biometrics-field';
import VerifyBiometrics from '../verify-biometrics';

const UserBiometricsInfo = () => {
  const { session } = useSessionUser();
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security.biometrics',
  );
  if (!session) {
    return null;
  }
  const { biometric } = session;
  const label = (
    <Typography variant="label-3" color="tertiary">
      {t('label')}
    </Typography>
  );

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

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default UserBiometricsInfo;
