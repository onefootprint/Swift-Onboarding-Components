'use client';

import { IcoFootprint24 } from '@onefootprint/icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { ButtonProps } from '../button';
import Button from '../button';
import Text from '../text';
import type { FootprintButtonSize } from './footprint-button.types';
import footprintButtonFontVariantBySize from './footprint-button.utils';

export type FootprintButtonProps = Omit<ButtonProps, 'children' | 'variant' | 'size'> & {
  text?: string;
  size?: FootprintButtonSize;
};

const FootprintButton = ({
  disabled = false,
  fullWidth,
  onClick,
  size = 'large',
  testID,
  type = 'button',
  text,
  loading,
  loadingAriaLabel,
}: FootprintButtonProps) => {
  const { t } = useTranslation('ui');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const className = buttonRef.current?.className;
  const isCustomAppearance = className?.includes('fp-custom-appearance');
  const renderedIcon = () => <StyledIcoFootprint24 color={isCustomAppearance ? 'primary' : 'septenary'} />;

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
      <Text color="quinary" variant={footprintButtonFontVariantBySize[size]}>
        {text ?? t('components.footprint-button.text-default')}
      </Text>
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
