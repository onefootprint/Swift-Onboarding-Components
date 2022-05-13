import React from 'react';
import { Box, Container } from 'ui';

import PlaygroundGradient from './components/playground-gradient';
import PlaygroundGrid from './components/playground-grid';
import PlaygroundGrigContent from './components/playground-grid-content';

type PlaygroundProps = {
  title: string;
  subtitle: string;
};

const Why = ({ title, subtitle }: PlaygroundProps) => (
  <Container as="section" id="playground">
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'inherit',
      }}
    >
      <PlaygroundGradient />
      <PlaygroundGrid />
      <PlaygroundGrigContent subtitle={subtitle} title={title} />
    </Box>
  </Container>
);

export default Why;
