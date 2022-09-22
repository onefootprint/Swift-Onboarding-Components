import { HeaderTitle, NavigationHeader } from 'footprint-elements';
import { useTranslation } from 'hooks';
import React from 'react';
import useGetD2PStatus, { D2PStatus } from 'src/hooks/d2p/use-get-d2p-status';
import { Events } from 'src/utils/state-machine/liveness-register';
import styled, { css } from 'styled-components';
import { LinkButton, LoadingIndicator } from 'ui';

import { useLivenessRegisterMachine } from '../../components/machine-provider';

const NewTabProcessing = () => {
  const { t } = useTranslation('pages.new-tab-processing');
  const [state, send] = useLivenessRegisterMachine();
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
