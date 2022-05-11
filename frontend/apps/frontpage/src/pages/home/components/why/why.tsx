import React from 'react';
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
      }}
    >
      <Grid />
      <OverlappingText subtitleText={subtitleText} titleText={titleText} />
    </Box>
  </Container>
);

export default Why;
