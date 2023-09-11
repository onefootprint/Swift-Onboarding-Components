import { IcoFootprint24 } from '@onefootprint/icons';
import React from 'react';

import type { ButtonProps } from '../button';
import Button from '../button';
import Typography from '../typography';
import type { FootprintButtonSize } from './footprint-button.types';
import footprintButtonFontVariantBySize from './footprint-button.utils';

export type FootprintButtonProps = Omit<
  ButtonProps,
  'children' | 'variant' | 'size'
> & {
  text?: string;
  size?: FootprintButtonSize;
};

const FootprintButton = ({
  disabled = false,
  fullWidth,
  onClick,
  size = 'default',
  testID,
  type = 'button',
  text = 'Verify with Footprint',
  loading,
  loadingAriaLabel,
}: FootprintButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    loading={loading}
    loadingAriaLabel={loadingAriaLabel}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
    variant="primary"
    prefixIcon={IcoFootprint24}
    iconColor="septenary"
  >
    <Typography
      color="quinary"
      variant={footprintButtonFontVariantBySize[size]}
    >
      {text}
    </Typography>
  </Button>
);

export default FootprintButton;
