import React from 'react';
import { Events } from 'src/bifrost-machine/types';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/bifrost/use-bifrost-machine';
import styled, { css } from 'styled';
import { Button } from 'ui';

const AdditionalInfoRequired = () => {
  const [, send] = useBifrostMachine();
  const handleClick = () => {
    send({
      type: Events.collectAdditionalInfo,
    });
  };
  const tenantName = 'AcmeBank'; // TODO: for now use a placeholder for tenant name.

  return (
    <Container>
      <Header
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
