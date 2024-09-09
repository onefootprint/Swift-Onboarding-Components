import { D2PStatus } from '@onefootprint/types';
import { LinkButton, LoadingSpinner } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import useCancelD2P from '../../../../hooks/use-cancel-d2p/use-cancel-d2p';
import { useGetD2PStatus } from '../../../../queries';
import useHandleD2PStatusUpdate from '../../hooks/use-handle-d2p-status-update';
import { useTransferMachine } from '../machine-provider.tsx';

type ProcessingProps = {
  title: string;
  subtitle: string;
  cta: string;
};

const Processing = ({ title, subtitle, cta }: ProcessingProps) => {
  const [state, send] = useTransferMachine();
  const { scopedAuthToken, tab } = state.context;

  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus({
    authToken: scopedAuthToken ?? '',
    options: {
      onSuccess: response => {
        if (response.status === D2PStatus.canceled) {
          tab?.close();
          send({ type: 'tabClosed' });
        }
        handleSuccess(response);
      },
      onError: error => {
        tab?.close();
        handleError(error);
      },
    },
  });

  const handleCancelD2p = useCancelD2P({
    authToken: scopedAuthToken,
    onSuccess: () => {
      send({ type: 'd2pSessionCanceled' });
      tab?.close();
      send({ type: 'tabClosed' });
    },
    onError: () => {
      send({
        type: 'd2pSessionExpired',
      });
    },
  });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle title={title} subtitle={subtitle} />
        <LoadingSpinner />
        <LinkButton onClick={handleCancelD2p} data-dd-action-name="transfer-processing:cancel">
          {cta}
        </LinkButton>
      </Container>
    </>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[7]};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `}
`;

export default Processing;
