import type { Icon } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';

type ListProps = {
  title: string;
  IconComponent: Icon;
  children: React.ReactNode;
};

const List = ({ title, IconComponent, children }: ListProps) => (
  <Box
    borderColor="tertiary"
    borderRadius="default"
    borderStyle="solid"
    borderWidth={1}
    flex={1}
    padding={3}
    tag="section"
  >
    <Stack tag="header" padding={3} gap={3}>
      <Box position="relative" top="3px">
        <IconComponent />
      </Box>
      <Text variant="label-3">{title}</Text>
    </Stack>
    <Box>{children}</Box>
  </Box>
);

export default List;
