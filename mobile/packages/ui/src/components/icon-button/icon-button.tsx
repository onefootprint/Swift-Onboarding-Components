import type { Icon } from '@onefootprint/icons';
import React, { useState } from 'react';

import Box from '../box';
import Pressable from '../pressable';

export type IconButtonProps = {
  'aria-label': string;
  children: React.ReactElement<Icon>;
  onPress?: () => void;
};

const IconButton = ({ 'aria-label': ariaLabel, children, onPress }: IconButtonProps) => {
  const [active, setActive] = useState(false);

  return (
    <Pressable onPress={onPress} onPressIn={() => setActive(true)} onPressOut={() => setActive(false)}>
      <Box
        aria-label={ariaLabel}
        backgroundColor={active ? 'senary' : 'secondary'}
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
};

export default IconButton;
