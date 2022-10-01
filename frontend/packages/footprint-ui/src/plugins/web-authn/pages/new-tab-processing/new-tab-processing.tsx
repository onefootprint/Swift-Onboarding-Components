import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useGetD2PStatus, { D2PStatus } from '../../hooks/use-get-d2p-status';
import useWebAuthnMachine from '../../hooks/use-web-authn-machine';
import { Events } from '../../utils/machine';

const NewTabProcessing = () => {
  const { t } = useTranslation('pages.new-tab-processing');
  const [state, send] = useWebAuthnMachine();
  useGetD2PStatus({
    onSuccess: ({ status }) => {
      if (status === D2PStatus.completed) {
        send({
          type: Events.newTabRegisterSucceeded,
        });
      }
      if (status === D2PStatus.failed) {
        send({
          type: Events.newTabRegisterFailed,
        });
      }
      if (status === D2PStatus.canceled) {
        handleCancel();
      }
    },
    onError: () => {
      send({
        type: Events.statusPollingErrored,
      });
    },
  });

  const closeTab = () => {
    if (state.context.tab) {
      state.context.tab.close();
    }
  };

  const handleCancel = () => {
    closeTab();
    send({
      type: Events.newTabRegisterCanceled,
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <LoadingIndicator />
        <LinkButton onClick={handleCancel}>{t('cancel')}</LinkButton>
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

export default NewTabProcessing;
