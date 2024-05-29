import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

type CardTitleProps = {
  title: string;
  subtitle: string;
};

const CardTitle = ({ title, subtitle }: CardTitleProps) => (
  <Stack direction="column" gap={3} padding={9} zIndex={2} position="relative">
    <Text variant="label-1" tag="h4">
      {title}
    </Text>
    <Text variant="body-2" tag="h5">
      {subtitle}
    </Text>
  </Stack>
);

export default CardTitle;
