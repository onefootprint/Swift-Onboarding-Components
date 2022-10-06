import { useTranslation } from '@onefootprint/hooks';
import { D2PStatus } from '@onefootprint/types';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import { HeaderTitle } from 'footprint-elements';
import React from 'react';
import { useLivenessCheckMachine } from 'src/pages/liveness-check/components/machine-provider';
import { Events } from 'src/utils/state-machine/liveness-check';
import styled, { css } from 'styled-components';

import useGetD2PStatus from '../../hooks/d2p/use-get-d2p-status';

const NewTabProcessing = () => {
  const { t } = useTranslation('pages.new-tab-processing');
  const [state, send] = useLivenessCheckMachine();
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
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <LoadingIndicator />
      <LinkButton onClick={handleCancel}>{t('cancel')}</LinkButton>
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

export default NewTabProcessing;
