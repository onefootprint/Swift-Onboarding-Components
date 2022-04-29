import React from 'react';

import Button, { ButtonProps } from '../button';
import IcoFootprint24 from '../icons/ico/ico-footprint-24';

export type FootprintButtonProps = Omit<ButtonProps, 'children'>;

// TODO: Adjust margin right, using theme properties using `xs`
const FootprintButton = ({
  disabled = false,
  fullWidth,
  onPress,
  size = 'default',
  testID,
  type = 'button',
  variant = 'primary',
}: FootprintButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    onPress={onPress}
    size={size}
    testID={testID}
    type={type}
    variant={variant}
  >
    <IcoFootprint24 color="senary" style={{ marginRight: '8px' }} />
    Verify with Footprint
  </Button>
);

export default FootprintButton;
