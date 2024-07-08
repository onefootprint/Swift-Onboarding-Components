import { Box, Text } from '@onefootprint/ui';
import React from 'react';

type SectionSubtitleProps = {
  $maxWidth?: string;
  children: React.ReactNode;
};

const SectionSubtitle = ({ $maxWidth, children }: SectionSubtitleProps) => (
  <Box maxWidth={$maxWidth}>
    <Text variant="display-4" color="secondary" textAlign="center" tag="h4">
      {children}
    </Text>
  </Box>
);

export default SectionSubtitle;
