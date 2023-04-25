import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import { useCreateHandoffUrl } from '../../../../../hooks/ui';
import useGenerateScopedAuthToken from '../../../hooks/mobile/use-generate-scoped-auth-token';
import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';

const NewTabRequest = () => {
  const { t } = useTranslation('pages.mobile.new-tab-requested');
  const [state, send] = useMobileMachine();
  const { scopedAuthToken } = state.context;
  const mutation = useGenerateScopedAuthToken();
  const url = useCreateHandoffUrl(scopedAuthToken);

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
