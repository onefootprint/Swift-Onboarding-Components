import type { Icon } from '@onefootprint/icons';
import React from 'react';

import { Box } from '../box';
import { Pressable } from '../pressable';

export type IconButtonProps = {
  'aria-label': string;
  children: React.ReactElement<Icon>;
  onPress?: () => void;
};

const IconButton = ({
  'aria-label': ariaLabel,
  children,
  onPress,
}: IconButtonProps) => (
  <Pressable onPress={onPress}>
    <Box
      aria-label={ariaLabel}
      borderRadius="full"
      center
      height={32}
      role="button"
      width={32}
    >
      {children}
    </Box>
  </Pressable>
);

export default IconButton;
