import React from 'react';
import HeaderTitle from 'src/components/header-title';
import NavigationHeader from 'src/components/navigation-header';
import { Events, MachineContext } from 'src/utils/state-machine/onboarding';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';

const AdditionalInfoRequired = () => {
  const [state, send] = useOnboardingMachine();
  const context = state.context as MachineContext;
  const handleClick = () => {
    send({
      type: Events.additionalInfoRequired,
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirm: true }} />
      <Container>
        <HeaderTitle
          title="Additional data is required"
          subtitle={`In addition to the data we already have on you, ${context.tenant.name} requires
          some more information to verify your identity.`}
        />
        <Button fullWidth onClick={handleClick}>
          Continue
        </Button>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
  `}
`;

export default AdditionalInfoRequired;
