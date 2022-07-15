import { useTranslation } from 'hooks';
import React, { useState } from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import LivenessCheck from 'src/pages/liveness-check';
import LivenessCheckDialog from 'src/pages/liveness-check/components/liveness-check-dialog';
import MachineProvider from 'src/pages/liveness-check/components/machine-provider';
import styled from 'styled-components';
import { Box, LinkButton, LoadingIndicator } from 'ui';

import BiometricsField from './components/biometrics-field';

const LoginAndSecurity = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security',
  );
  const { data } = useSessionUser();
  const [livenessCheckVisible, setLivenessCheckVisible] = useState(false);
  if (!data) {
    return null;
  }

  const { email, phoneNumber, isBiometricsVerified, device } = data;
  const shouldShowVerifyButton = !isBiometricsVerified;
  const isVerificationLoading = false;
  const handleVerify = () => {
    // TODO: https://linear.app/footprint/issue/FP-530/implement-liveness-checkregister
    // TODO: first, we start out by implementing desktop flow, implement mobile next
    setLivenessCheckVisible(true);
  };

  const handleCloseLivenessCheck = () => {
    setLivenessCheckVisible(false);
  };

  return (
    <>
      <FieldGroup>
        <Field label={t('email.label')} value={email} />
        <Field label={t('phone-number.label')} value={phoneNumber} />
        <BiometricsContainer>
          <BiometricsField verified={isBiometricsVerified} device={device} />
          {shouldShowVerifyButton && (
            <Box>
              {isVerificationLoading ? (
                <LoadingIndicator aria-label={t('loading')} />
              ) : (
                <LinkButton size="compact" onClick={handleVerify}>
                  {t('biometrics.cta')}
                </LinkButton>
              )}
            </Box>
          )}
        </BiometricsContainer>
      </FieldGroup>
      <LivenessCheckDialog
        onClose={handleCloseLivenessCheck}
        open={livenessCheckVisible}
      >
        <MachineProvider>
          <LivenessCheck />
        </MachineProvider>
      </LivenessCheckDialog>
    </>
  );
};

const BiometricsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default LoginAndSecurity;
