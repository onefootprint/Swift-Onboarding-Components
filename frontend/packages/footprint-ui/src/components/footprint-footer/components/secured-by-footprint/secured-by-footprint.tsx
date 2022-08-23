import { IcoFootprint16 } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const SecuredByFootprint = () => (
  <Container>
    <IcoFootprint16 />
    <TextContainer>
      <Typography variant="caption-1" color="secondary">
        Secured by Footprint
      </Typography>
    </TextContainer>
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]}px;
  `}
`;

export default SecuredByFootprint;
