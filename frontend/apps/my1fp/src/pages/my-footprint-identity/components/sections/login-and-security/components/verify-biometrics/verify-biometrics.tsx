import { useTranslation } from '@onefootprint/hooks';
import { Box, LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import LivenessCheck from 'src/pages/liveness-check';

import useGetLiveness from '../../hooks/use-get-liveness/use-get-liveness';

const VerifyBiometrics = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security.biometrics',
  );
  const { session, updateBiometric } = useSessionUser();
  const livenessQuery = useGetLiveness();
  const [livenessCheckVisible, setLivenessCheckVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return null;
  }

  const handleStartLivenessCheck = () => {
    setIsLoading(true);
    setLivenessCheckVisible(true);
  };
  const handleCloseLivenessCheck = () => {
    livenessQuery
      .refetch()
      .then(query => {
        const { data } = query;
        if (data) {
          updateBiometric(query.data);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    setLivenessCheckVisible(false);
  };

  return (
    <Box testID="verify-biometrics">
      {isLoading ? (
        <Box>
          <LoadingIndicator aria-label={t('loading')} />
        </Box>
      ) : (
        <LinkButton size="compact" onClick={handleStartLivenessCheck}>
          {t('cta')}
        </LinkButton>
      )}
      {livenessCheckVisible && (
        <LivenessCheck onClose={handleCloseLivenessCheck} />
      )}
    </Box>
  );
};

export default VerifyBiometrics;
