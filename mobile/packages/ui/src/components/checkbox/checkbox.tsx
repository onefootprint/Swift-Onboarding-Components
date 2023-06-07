import { IcoCheckSmall16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import React from 'react';

import { Box } from '../box';
import { Pressable } from '../pressable';
import { Typography } from '../typography';

export type CheckboxProps = {
  label?: string;
  onValueChange: (newValue: boolean) => void;
  value: boolean;
};

const Checkbox = ({ label, value, onValueChange }: CheckboxProps) => {
  const handlePress = () => {
    onValueChange(!value);
  };

  return (
    <StyledPressable onPress={handlePress} withImpact>
      <Box gap={4} flexDirection="row">
        <Box
          backgroundColor={value ? 'tertiary' : 'primary'}
          borderColor={value ? 'transparent' : 'primary'}
          borderRadius="default"
          borderStyle="solid"
          borderWidth={1}
          center
          height={16}
          marginTop={2}
          width={16}
        >
          {value ? <IcoCheckSmall16 color="quinary" /> : null}
        </Box>
        {label && (
          <Typography variant="body-4" flexShrink={1}>
            {label}
          </Typography>
        )}
      </Box>
    </StyledPressable>
  );
};

const StyledPressable = styled(Pressable)`
  width: 100%;
`;

export default Checkbox;
