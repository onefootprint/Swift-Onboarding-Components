import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../components/header-title';
import NavigationHeader from '../../../../../components/navigation-header';
import { createHandoffUrl } from '../../../../../utils/handoff-url';
import useGenerateScopedAuthToken from '../../../hooks/mobile/use-generate-scoped-auth-token';
import useMobileMachine, {
  Events,
} from '../../../hooks/mobile/use-mobile-machine';

const NewTabRequest = () => {
  const { t } = useTranslation('pages.mobile.new-tab-requested');
  const [state, send] = useMobileMachine();
  const { authToken, scopedAuthToken } = state.context;
  const { mutation, generateScopedAuthToken } = useGenerateScopedAuthToken();

  useEffect(() => {
    if (authToken) {
      generateScopedAuthToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleClick = () => {
    const tab = window.open(
      createHandoffUrl({ authToken: scopedAuthToken, opener: 'mobile' }),
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
        <Button onClick={handleClick} fullWidth disabled={mutation.isLoading}>
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
    row-gap: ${theme.spacing[7]};
  `}
`;

export default NewTabRequest;
