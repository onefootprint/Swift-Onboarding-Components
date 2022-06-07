import React from 'react';
import HeaderTitle from 'src/components/header-title';
import { Events } from 'src/utils/state-machine/onboarding';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';

const AdditionalInfoRequired = () => {
  const [, send] = useOnboardingMachine();
  const handleClick = () => {
    send({
      type: Events.additionalInfoRequired,
    });
  };
  const tenantName = 'AcmeBank'; // TODO: for now use a placeholder for tenant name.

  return (
    <Container>
      <HeaderTitle
        title="Additional data is required"
        subtitle={`In addition to the data we already have on you, ${tenantName} requires
          some more information to verify your identity.`}
      />
      <Button fullWidth onClick={handleClick}>
        Continue
      </Button>
    </Container>
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
