import { IcoFootprint24 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import React, { useRef } from 'react';

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
}: FootprintButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const className = buttonRef.current?.className;
  const isCustomAppearance = className?.includes('fp-custom-appearance');
  const renderedIcon = () => (
    <StyledIcoFootprint24
      color={isCustomAppearance ? 'primary' : 'septenary'}
    />
  );

  return (
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
      prefixIcon={renderedIcon}
      iconColor="septenary"
      ref={buttonRef}
    >
      <Typography
        color="quinary"
        variant={footprintButtonFontVariantBySize[size]}
      >
        {text}
      </Typography>
    </Button>
  );
};

const StyledIcoFootprint24 = styled(IcoFootprint24)`
  &&& {
    path {
      stroke: none;
    }
  }
`;

export default FootprintButton;
