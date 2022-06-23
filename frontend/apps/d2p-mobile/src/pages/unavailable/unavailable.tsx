import { useTranslation } from 'hooks';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import HeaderTitle from '../../components/header-title';
import useD2PMobileMachine from '../../hooks/use-d2p-mobile-machine';
import useUpdateD2pStatus, {
  D2PStatusUpdate,
} from '../../hooks/use-update-d2p-status';

const Unavailable = () => {
  const { t } = useTranslation('pages.unavailable');
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
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Unavailable;
