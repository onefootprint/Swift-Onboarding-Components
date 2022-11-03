import React, { forwardRef, useId, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createFontStyles, createOverlayBackground } from '../../utils/mixins';

export type ToggleProps = {
  'aria-label'?: string;
  checked?: boolean;
  defaultChecked?: boolean;
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
};

const Switch = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      'aria-label': ariaLabel,
      label,
      labelPlacement = 'left',
      checked: initialChecked,
      defaultChecked,
      disabled,
      id: possibleId,
      name,
      onBlur,
      onChange,
      onFocus,
      required,
      sx,
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
      <ToggleContainer data-placement={labelPlacement} sx={sxStyles}>
        {label && (
          <Label data-placement={labelPlacement} htmlFor={id}>
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
          aria-label={ariaLabel}
          checked={checked}
          disabled={disabled}
          onBlur={onBlur}
          onClick={handleClick}
          onFocus={onFocus}
          role="switch"
          type="button"
        >
          <StyledIcoToggleKnob16 checked={checked} disabled={disabled} />
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
  justify-content: center;

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

const Label = styled.label`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
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

const Button = styled.button<{ checked?: boolean }>`
  ${({ theme, checked }) => css`
    background: ${theme.backgroundColor[checked ? 'accent' : 'secondary']};
    border-color: ${theme.borderColor[checked ? 'transparent' : 'primary']};
    border-radius: ${theme.borderRadius.full};
    border-style: solid;
    border-width: ${theme.borderWidth[2]};
    cursor: pointer;
    height: 24px;
    outline-offset: ${theme.spacing[2]};
    padding: ${theme.spacing[1]};
    width: 36px;

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

const StyledIcoToggleKnob16 = styled.div<{
  disabled?: boolean;
  checked?: boolean;
}>`
  ${({ theme, disabled, checked }) => css`
    background: ${theme.color[checked ? 'quinary' : 'tertiary']};
    border-radius: ${theme.borderRadius.full};
    display: block;
    height: 16px;
    transform: ${checked ? 'translateX(12px)' : 'translateX(0px)'};
    transition: 0.2s all ease;
    width: 16px;

    ${disabled &&
    css`
      opacity: ${checked ? 1 : 0.3};
      background: ${theme.color[checked ? 'quinary' : 'quaternary']};
    `}
  `}
`;

export default Switch;
