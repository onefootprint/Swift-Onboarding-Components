import { Container, Grid, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Tag from './components/tag/tag';

const values = {
  card: {
    tag: '{{ fp_id_SrdJshjthjSQq.cred_card }}',
    value: '1234 1234 1234 1234',
    x: 100,
    y: 50,
    hideMobile: false,
  },
  cvv: {
    tag: '{{ fp_id_SrdJshjthjSQq.cvv }}',
    value: '123',
    x: 20,
    y: 20,
    hideMobile: false,
  },
  exp: {
    tag: '{{ fp_id_SrdJshjthjSQq.exp }}',
    value: '12/22',
    x: 60,
    y: 75,
    hideMobile: true,
  },
  name: {
    tag: '{{ fp_id_SrdJshjthjSQq.name }}',
    value: 'John Doe',
    x: 150,
    y: 30,
    hideMobile: true,
  },
  address: {
    tag: '{{ fp_id_SrdJshjthjSQq.address }}',
    value: '1234 Main St',
    x: 135,
    y: 70,
    hideMobile: false,
  },
  snn: {
    tag: '{{ fp_id_SrdJshjthjSQq.snn }}',
    value: '123-45-6789',
    x: 35,
    y: 40,
    hideMobile: true,
  },
};

const VaultProxyIllustration = () => (
  <StyledContainer>
    <Grid.Container
      columns={['1fr 1fr']}
      templateAreas={['left right']}
      width="100%"
      height="380px"
      position="relative"
    >
      <Grid.Item gridArea="left" overflow="hidden">
        {Object.values(values).map(value => (
          <StyledTag key={value.tag} x={value.x} y={value.y} hideMobile={value.hideMobile}>
            {value.tag}
          </StyledTag>
        ))}
      </Grid.Item>
      <Grid.Item gridArea="right" overflow="hidden">
        {Object.values(values).map(value => (
          <StyledTag key={value.tag} x={value.x - 100} y={value.y} hideMobile={value.hideMobile}>
            {value.value}
          </StyledTag>
        ))}
      </Grid.Item>
    </Grid.Container>
    <Light />
  </StyledContainer>
);

const StyledContainer = styled(Container)`
  mask: radial-gradient(50% 50% at 50% 50%, black 0%, transparent 100%);
  mask-mode: alpha;
  position: relative;
`;

const StyledTag = styled(Tag)<{ x: number; y: number; hideMobile?: boolean }>`
  ${({ x, y, hideMobile }) => css`
    position: absolute;
    display: ${hideMobile ? 'none' : 'block'};
    top: ${y}%;
    left: ${x}%;
    z-index: 1;
    transform: translateX(-50%);

    ${media.greaterThan('md')`
        display: block;
    `}
  `}
`;

const Light = styled.div`
  position: absolute;
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  width: 4px;
  background: radial-gradient(
    100% 100% at 50% 50%,
    #7255e3 0%,
    transparent 50%
  );

  &::before {
    z-index: 0;
    content: '';
    opacity: 0.3;
    top: 0;
    position: absolute;
    width: 200px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: radial-gradient(
      50% 100% at 50% 50%,
      #7255e3 0,
      transparent 50%
    );
  }
`;

export default VaultProxyIllustration;
