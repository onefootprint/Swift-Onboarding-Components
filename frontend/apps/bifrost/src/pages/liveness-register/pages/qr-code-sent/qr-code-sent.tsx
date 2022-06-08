import React from 'react';
import HeaderTitle from 'src/components/header-title';
import useUpdateD2PStatus, {
  D2PStatusUpdate,
} from 'src/hooks/d2p/use-update-d2p-status';
import { Events } from 'src/utils/state-machine/liveness-register';
import styled, { css } from 'styled-components';
import { LinkButton, LoadingIndicator } from 'ui';

import { useLivenessRegisterMachine } from '../../components/machine-provider';

const QRCodeSent = () => {
  const [state, send] = useLivenessRegisterMachine();
  const updateD2PStatusMutation = useUpdateD2PStatus();

  const handleCancel = () => {
    const authToken = state.context.scopedAuthToken;
    updateD2PStatusMutation.mutate(
      { authToken, status: D2PStatusUpdate.canceled },
      {
        onSuccess() {
          send({ type: Events.qrCodeCanceled });
        },
      },
    );
  };

  return (
    <Container>
      <HeaderTitle
        title="Liveness check"
        subtitle="Link sent to phone. Please continue from there."
      />
      <LoadingIndicator />
      <LinkButton onClick={handleCancel}>Cancel</LinkButton>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[7]}px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `}
`;

export default QRCodeSent;
