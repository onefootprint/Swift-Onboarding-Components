import { motion } from 'framer-motion';
import React, { forwardRef, useId, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createFontStyles, createOverlayBackground } from '../../utils/mixins';

export type ToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  labelPlacement?: 'left' | 'right';
  name?: string;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  required?: boolean;
  sx?: SXStyleProps;
  size?: 'default' | 'compact';
};

const Switch = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      labelPlacement = 'left',
      checked: initialChecked,
      fullWidth = false,
      defaultChecked,
      disabled,
      id: possibleId,
      name,
      onBlur,
      onChange,
      onFocus,
      required,
      sx,
      size = 'default',
    }: ToggleProps,
    ref,
  ) => {
    const internalId = useId();
    const id = possibleId || internalId;
    const isControlled = typeof initialChecked !== 'undefined';
    const checked = isControlled ? initialChecked : defaultChecked || false;
    const localRef = useRef<HTMLInputElement>(null);
    const sxStyles = useSX(sx);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // This will trigger a native change event, so we can use web standards
      // stop propagation is required because of the button event bubbling
      event.stopPropagation();
      const input = localRef.current;
      if (input) {
        const nextChecked = !checked;
        const inputProto = window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(
          inputProto,
          'checked',
        ) as PropertyDescriptor;
        const setChecked = descriptor.set;
        if (setChecked) {
          const checkEvent = new Event('click', { bubbles: true });
          setChecked.call(input, nextChecked);
          input.dispatchEvent(checkEvent);
        }
      }
    };

    return (
      <ToggleContainer
        data-placement={labelPlacement}
        data-full-width={fullWidth}
        sx={sxStyles}
      >
        {label && (
          <Label data-placement={labelPlacement} htmlFor={id} size={size}>
            {label}
          </Label>
        )}
        <Input
          aria-hidden="true"
          checked={isControlled ? checked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={disabled}
          id={id}
          name={name}
          onChange={onChange}
          ref={mergeRefs([localRef, ref])}
          required={required}
          tabIndex={-1}
          type="checkbox"
        />
        <Button
          aria-checked={checked}
          aria-label={label}
          checked={checked}
          disabled={disabled}
          onBlur={onBlur}
          onClick={handleClick}
          onFocus={onFocus}
          size={size}
          role="switch"
          type="button"
          layout
          layoutRoot
        >
          <StyledIcoToggleKnob16
            checked={checked}
            disabled={disabled}
            size={size}
            transition={{
              duration: 0.2,
              type: 'spring',
              stiffness: 700,
              damping: 30,
            }}
            layout
          />
        </Button>
      </ToggleContainer>
    );
  },
);

const ToggleContainer = styled.div<{
  sx: SXStyles;
}>`
  display: flex;
  align-items: center;

  &[data-full-width='false'] {
    justify-content: center;
  }

  &[data-full-width='true'] {
    justify-content: space-between;
  }

  &[data-placement='left'] {
    flex-direction: row;
  }

  &[data-placement='right'] {
    flex-direction: row-reverse;
  }

  ${({ sx }) => css`
    ${sx}
  `}
`;

const Label = styled.label<{ size: 'default' | 'compact' }>`
  ${({ theme, size }) => css`
    ${size === 'compact'
      ? createFontStyles('body-4')
      : createFontStyles('label-3')};
    color: ${theme.color.primary};
    cursor: pointer;

    &[data-placement='left'] {
      margin-right: ${theme.spacing[3]};
    }

    &[data-placement='right'] {
      margin-left: ${theme.spacing[3]};
    }
  `}
`;

const Input = styled.input`
  height: 24px;
  margin: 0px;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transform: translateX(-100%);
  width: 36px;
`;

const Button = styled(motion.button)<{
  checked?: boolean;
  size?: 'default' | 'compact';
}>`
  ${({ theme, checked, size }) => css`
    background: ${theme.backgroundColor[checked ? 'accent' : 'secondary']};
    border-color: ${theme.borderColor[checked ? 'transparent' : 'primary']};
    border-radius: ${theme.borderRadius.full};
    border-style: solid;
    border-width: ${theme.borderWidth[2]};
    cursor: pointer;
    height: ${size === 'compact' ? 20 : 24}px;
    outline-offset: ${theme.spacing[2]};
    padding: ${theme.spacing[1]};
    width: ${size === 'compact' ? 30 : 36}px;
    display: flex;
    justify-content: ${checked ? 'flex-end' : 'flex-start'};

    &:hover {
      ${createOverlayBackground('darken-1', checked ? 'accent' : 'secondary')}
    }

    &:disabled {
      border-color: ${theme.borderColor[checked ? 'transparent' : 'tertiary']};
      ${checked &&
      css`
        opacity: 0.4;
      `}
    }
  `}
`;

const StyledIcoToggleKnob16 = styled(motion.div)<{
  disabled?: boolean;
  checked?: boolean;
  size?: 'default' | 'compact';
}>`
  ${({ theme, disabled, checked, size }) => css`
    background: ${theme.color[checked ? 'quinary' : 'tertiary']};
    border-radius: ${theme.borderRadius.full};
    display: block;
    height: ${size === 'compact' ? 12 : 16}px;
    width: ${size === 'compact' ? 12 : 16}px;

    ${disabled &&
    css`
      opacity: ${checked ? 1 : 0.3};
      background: ${theme.color[checked ? 'quinary' : 'quaternary']};
    `}
  `}
`;

export default Switch;
