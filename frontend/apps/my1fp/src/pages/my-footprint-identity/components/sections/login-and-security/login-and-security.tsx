import { useTranslation } from 'hooks';
import React from 'react';
import Field from 'src/components/field';
import FieldGroup from 'src/components/field-group';
import useSessionUser from 'src/hooks/use-session-user';
import styled from 'styled-components';
import { Box, LinkButton, LoadingIndicator } from 'ui';

import BiometricsField from './components/biometrics-field';

const LoginAndSecurity = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security',
  );
  const {
    data: { email, phoneNumber, isBiometricsVerified, device },
  } = useSessionUser();
  const shouldShowVerifyButton = !isBiometricsVerified;
  const isVerificationLoading = false;
  const handleVerify = () => {
    // TODO: https://linear.app/footprint/issue/FP-530/implement-liveness-checkregister
  };

  return (
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
  );
};

const BiometricsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default LoginAndSecurity;
