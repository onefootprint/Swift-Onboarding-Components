import { IcoChevronRight24, IcoInfo16 } from '@onefootprint/icons';
import React from 'react';

import { Box } from '../box';
import { Pressable } from '../pressable';
import { Typography } from '../typography';

export type InlineAlertProps = {
  children: string;
  onPress?: () => void;
};

const InlineAlert = ({ children, onPress }: InlineAlertProps) => {
  return (
    <Box>
      <Pressable onPress={onPress}>
        <Box
          alignItems="center"
          borderColor="tertiary"
          borderRadius="default"
          borderStyle="dashed"
          borderWidth={1}
          flexDirection="row"
          gap={3}
          paddingHorizontal={5}
          paddingVertical={4}
        >
          <IcoInfo16 />
          <Typography variant="body-2">{children}</Typography>
          <IcoChevronRight24 />
        </Box>
      </Pressable>
    </Box>
  );
};

export default InlineAlert;
