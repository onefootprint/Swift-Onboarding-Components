import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { D2PGenerateResponse } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import { useCreateHandoffUrl } from '../../../../../hooks';
import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';
import useGenerateScopedAuthToken from '../../../hooks/use-generate-scoped-auth-token';

const NewTabRequest = () => {
  const { t } = useTranslation('pages.mobile.new-tab-requested');
  const [state, send] = useMobileMachine();
  const { authToken, device, config, scopedAuthToken, idDocOutcome } =
    state.context;
  const url = useCreateHandoffUrl({
    authToken: scopedAuthToken,
    onboardingConfig: config,
  });
  const { mutation } = useGenerateScopedAuthToken({
    authToken,
    device,
    config,
    idDocOutcome,
    onSuccess: (data: D2PGenerateResponse) => {
      send({
        type: 'scopedAuthTokenGenerated',
        payload: {
          scopedAuthToken: data.authToken,
        },
      });
    },
  });

  const handleClick = () => {
    if (!url) {
      return;
    }

    const tab = window.open(url, '_blank');
    if (tab) {
      send({
        type: 'newTabOpened',
        payload: { tab },
      });
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
        <Button
          onClick={handleClick}
          fullWidth
          disabled={mutation.isLoading || !scopedAuthToken}
        >
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
