import IcoFootprint16 from 'icons/ico/ico-footprint-16';
import React from 'react';
import styled, { css } from 'styled-components';
import type { FontVariant } from 'themes';
import { Typography } from 'ui';

type SecuredByFootprintProps = {
  fontVariant: FontVariant;
};

const SecuredByFootprint = ({ fontVariant }: SecuredByFootprintProps) => (
  <Container>
    <IcoFootprint16 />
    <TextContainer>
      <Typography variant={fontVariant} color="secondary">
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
