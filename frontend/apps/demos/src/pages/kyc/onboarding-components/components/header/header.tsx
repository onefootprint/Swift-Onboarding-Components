import { IcoClose16, IcoCode16 } from '@onefootprint/icons';
import { Box, IconButton, Stack, Text, Toggle } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  children: string;
  showLogs: boolean;
  onShowLogs: () => void;
};

const Header = ({ children, showLogs, onShowLogs }: HeaderProps) => (
  <Stack
    center
    borderBottomWidth={1}
    borderColor="tertiary"
    borderStyle="solid"
    flexShrink={0}
    height="48px"
    position="sticky"
    backgroundColor="primary"
    top="0px"
    zIndex={1}
  >
    <Text variant="label-2">{children}</Text>
    <Box position="absolute" right="8px" display="flex" gap={3}>
      <Text variant="label-3" color="secondary">
        Show logs
      </Text>
      <Toggle checked={showLogs} onChange={onShowLogs} size="compact" />
    </Box>
  </Stack>
);

export default Header;
