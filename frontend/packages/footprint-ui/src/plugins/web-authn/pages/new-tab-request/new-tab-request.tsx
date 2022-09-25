import { useTranslation } from '@onefootprint/hooks';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import HeaderTitle from '../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useGenerateScopedAuthToken from '../../hooks/use-generate-scoped-auth-token';
import useWebAuthnMachine from '../../hooks/use-web-authn-machine';
import createBiometricUrl from '../../utils/create-biometric-url';
import { Events } from '../../utils/machine';

const NewTabRequest = () => {
  const { t } = useTranslation('pages.new-tab-requested');
  const [state, send] = useWebAuthnMachine();
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
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Button onClick={handleClick} fullWidth>
          {t('cta')}
        </Button>
      </Container>
    </>
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
