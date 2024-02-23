import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

type HeadingProps = {
  title: string;
  subtitle: string;
};

const Heading = ({ title, subtitle }: HeadingProps) => (
  <Hero direction="column" align="center" justify="center" gap={3}>
    <Text
      color="primary"
      variant="display-2"
      as="h1"
      sx={{ textAlign: 'center' }}
    >
      {title}
    </Text>
    <Text
      color="secondary"
      variant="display-4"
      as="p"
      sx={{ textAlign: 'center' }}
    >
      {subtitle}
    </Text>
  </Hero>
);

const Hero = styled(Stack)`
  margin: auto;
  max-width: 700px;
`;

export default Heading;
