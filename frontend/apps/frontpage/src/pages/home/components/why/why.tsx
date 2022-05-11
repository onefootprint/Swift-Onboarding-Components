import React from 'react';
import styled from 'styled';
import { Box, Container } from 'ui';

import Grid from './components/grid';
import OverlappingText from './components/overlapping-text';

type WhyProps = {
  titleText: string;
  subtitleText: string;
};

const Why = ({ titleText, subtitleText }: WhyProps) => (
  <Container
    sx={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'inherit',
      }}
    >
      <Gradient />
      <Grid />
      <OverlappingText subtitleText={subtitleText} titleText={titleText} />
    </Box>
  </Container>
);

const Gradient = styled.div`
  pointer-events: none;
  background: linear-gradient(
    0deg,
    rgba(118, 251, 143, 0.6) 0%,
    rgba(118, 251, 143, 0) 100%
  );
  filter: blur(240px);
  position: absolute;
  width: 1128px;
  height: 323px;
  left: 0;
  top: 0px;
`;

export default Why;
