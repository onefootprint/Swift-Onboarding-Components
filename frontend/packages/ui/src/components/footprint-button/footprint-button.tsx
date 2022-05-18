import IcoFootprint24 from 'icons/ico/ico-footprint-24';
import React from 'react';

import Button, { ButtonProps } from '../button';

export type FootprintButtonProps = Omit<ButtonProps, 'children' | 'variant'>;

// TODO: Adjust margin right, using theme properties using `xs`
const FootprintButton = ({
  disabled = false,
  fullWidth,
  onClick,
  size = 'default',
  testID,
  type = 'button',
}: FootprintButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
    variant="primary"
  >
    <IcoFootprint24 color="senary" style={{ marginRight: '8px' }} />
    Verify with Footprint
  </Button>
);

export default FootprintButton;
