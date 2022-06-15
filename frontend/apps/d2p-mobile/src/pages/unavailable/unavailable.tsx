import React, { useEffect } from 'react';
import HeaderTitle from 'src/components/header-title';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import useUpdateD2pStatus, {
  D2PStatusUpdate,
} from 'src/hooks/use-update-d2p-status';
import styled from 'styled-components';

const Unavailable = () => {
  const [state] = useD2PMobileMachine();
  const updateD2PStatusMutation = useUpdateD2pStatus();
  useEffect(() => {
    updateD2PStatusMutation.mutate({
      authToken: state.context.authToken,
      status: D2PStatusUpdate.failed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <HeaderTitle
        title="No biometric authentication available"
        subtitle="Unfortunately your device doesn't support biometric authentication. Please continue on your computer."
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Unavailable;
