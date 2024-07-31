import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <Stack gap={2} flexDirection="column" tag="header" aria-label={title} role="heading">
      <Text variant="label-1" color="secondary">
        {title}
      </Text>
      <Text variant="body-2" color="secondary">
        {subtitle}
      </Text>
    </Stack>
  );
};

export default Header;
