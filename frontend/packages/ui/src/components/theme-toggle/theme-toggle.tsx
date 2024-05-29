'use client';

import { primitives } from '@onefootprint/design-tokens';
import { IcoMoon16, IcoSun16 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import React, { forwardRef, useId, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type ThemeToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  name?: string;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
};

const ThemeSwitch = forwardRef<HTMLInputElement, ThemeToggleProps>(
  (
    {
      label,
      checked: initialChecked,
      defaultChecked,
      name,
      onBlur,
      onChange,
      onFocus,
    }: ThemeToggleProps,
    ref,
  ) => {
    const id = useId();
    const isControlled = typeof initialChecked !== 'undefined';
    const checked = isControlled ? initialChecked : defaultChecked || false;
    const localRef = useRef<HTMLInputElement>(null);

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
      <ToggleContainer>
        {label && <Label htmlFor={id}>{label}</Label>}
        <Input
          aria-hidden="true"
          checked={isControlled ? checked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          id={id}
          name={name}
          onChange={onChange}
          ref={mergeRefs([localRef, ref])}
          tabIndex={-1}
          type="checkbox"
        />
        <Button
          aria-checked={checked}
          aria-label={label}
          checked={checked}
          onBlur={onBlur}
          onClick={handleClick}
          onFocus={onFocus}
          role="switch"
          type="button"
          layout
          layoutRoot
        >
          <StyledIcoToggleKnob16
            transition={{
              duration: 0.2,
              type: 'spring',
              stiffness: 700,
              damping: 30,
            }}
            layout
          >
            {checked ? <IcoMoon16 /> : <IcoSun16 />}
          </StyledIcoToggleKnob16>
        </Button>
      </ToggleContainer>
    );
  },
);

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const Label = styled.label`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
    cursor: pointer;
    margin-right: ${theme.spacing[3]};
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
}>`
  ${({ theme, checked }) => css`
    cursor: pointer;
    background: ${theme.backgroundColor.senary};
    border-color: ${theme.backgroundColor.senary};
    border-radius: ${theme.borderRadius.full};
    border-style: solid;
    border-width: ${theme.borderWidth[1]};
    outline-offset: ${theme.spacing[2]};
    padding: ${theme.spacing[1]};
    width: 36px;
    display: flex;
    justify-content: ${checked ? 'flex-end' : 'flex-start'};
    transition: all 0.2s ease-in-out;

    @media (hover: hover) {
      &:hover {
        background-color: ${checked ? primitives.Gray600 : primitives.Gray200};
        border-color: ${checked ? primitives.Gray600 : primitives.Gray200};
      }
    }
  `}
`;

const StyledIcoToggleKnob16 = styled(motion.div)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[1]};
    border-radius: ${theme.borderRadius.full};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[1]};
  `}
`;

export default ThemeSwitch;
