import { useTranslation } from 'hooks';
import React, { useEffect } from 'react';
import HeaderTitle from 'src/components/header-title';
import createBiometricUrl from 'src/utils/create-biometric-url';
import { Events } from 'src/utils/state-machine/liveness-register';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import { useLivenessRegisterMachine } from '../../components/machine-provider';
import useGenerateScopedAuthToken from '../../hooks/use-generate-scoped-auth-token';

const NewTabRequest = () => {
  const { t } = useTranslation('pages.new-tab-requested');
  const [state, send] = useLivenessRegisterMachine();
  const { authToken, scopedAuthToken } = state.context;
  const generateScopedAuthToken = useGenerateScopedAuthToken();

  useEffect(() => {
    if (authToken) {
      generateScopedAuthToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleClick = () => {
    const deviceType = state.context.device.type;
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
