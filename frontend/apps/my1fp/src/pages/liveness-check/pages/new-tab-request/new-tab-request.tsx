import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import { HeaderTitle } from 'footprint-elements';
import React, { useEffect } from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import { Events } from 'src/utils/state-machine/liveness-check';
import styled, { css } from 'styled-components';

import { useLivenessCheckMachine } from '../../components/machine-provider';
import useGenerateScopedAuthToken from '../../hooks/d2p/use-generate-scoped-auth-token';
import createBiometricUrl from '../../utils/create-biometric-url';

const NewTabRequest = () => {
  const { t } = useTranslation('pages.liveness-check.new-tab-request');
  const [state, send] = useLivenessCheckMachine();
  const { scopedAuthToken } = state.context;
  const generateScopedAuthToken = useGenerateScopedAuthToken();
  const { session } = useSessionUser();
  const authToken = session?.authToken;

  useEffect(() => {
    if (!scopedAuthToken && authToken) {
      generateScopedAuthToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, scopedAuthToken]);

  const handleClick = () => {
    if (!scopedAuthToken) {
      return;
    }
    const deviceType = state.context.device?.type;
    const tab = window.open(
      createBiometricUrl(scopedAuthToken, deviceType),
      '_blank',
    );
    if (tab) {
      send({ type: Events.newTabOpened, payload: { tab } });
    } else {
      // TODO: What we should do?
      // https://linear.app/footprint/issue/FP-408/what-do-when-window-couldnt-be-opened
    }
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button onClick={handleClick} fullWidth>
        {t('cta')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default NewTabRequest;
