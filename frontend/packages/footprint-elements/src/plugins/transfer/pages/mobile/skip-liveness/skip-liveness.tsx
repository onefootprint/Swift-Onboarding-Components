import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import NavigationHeader from '../../../../../components/navigation-header';
import { useSkipLiveness } from '../../../../../hooks';
import useMobileMachine, {
  Events,
  MachineContext,
} from '../../../hooks/mobile/use-mobile-machine';

const SkipLiveness = () => {
  const [state, send] = useMobileMachine();
  const { authToken, tenant }: MachineContext = state.context;
  const skipLivenessMutation = useSkipLiveness();

  useEffectOnce(() => {
    if (!tenant?.pk) {
      return;
    }
    skipLivenessMutation.mutate(
      { authToken, tenantPk: tenant.pk },
      {
        onSuccess: () => {
          send({
            type: Events.livenessSkipped,
          });
        },
      },
    );
  });

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <LoadingIndicator />
      </Container>
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

export default SkipLiveness;
