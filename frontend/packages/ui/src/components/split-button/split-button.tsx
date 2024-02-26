import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';

import Stack from '../stack';
import type { Option } from './components/dropdown-options';
import DropdownOptions from './components/dropdown-options';
import MainButton from './components/main-button';
import type { ButtonVariant } from './split-button.types';

const BUTTON_HEIGHT = 32;

export type SplitButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  options: Option[];
  flat?: boolean;
};

const Button = forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      disabled = false,
      loading = false,
      type = 'button',
      variant = 'primary',
      options,
      flat = false,
    }: SplitButtonProps,
    ref,
  ) => {
    const [activeOption, setActiveOption] = useState<Option>(options[0]);

    return (
      <Stack
        direction="row"
        width="fit-content"
        position="relative"
        height={`${BUTTON_HEIGHT - 2}px`}
        data-flat={flat}
      >
        <MainButton
          disabled={disabled}
          loading={loading}
          onClick={activeOption.onSelect}
          ref={ref}
          type={type}
          variant={variant}
          tab-index="0"
          flat={flat}
        >
          {activeOption.label}
        </MainButton>
        <Divider />
        <DropdownOptions
          options={options}
          variant={variant}
          loading={loading}
          disabled={disabled}
          onOptionChange={(option: Option) => {
            setActiveOption(option);
            option.onSelect();
          }}
          tab-index="1"
          flat={flat}
        />
      </Stack>
    );
  },
);

const Divider = styled.span`
  ${({ theme }) => css`
    position: relative;
    height: 100%;
    width: 0px;

    &:before {
      content: '';
      height: 100%;
      position: absolute;
      top: calc(50% + ${theme.borderWidth[1]});
      width: 1px;
      transform: translate(-50%, -50%);
      background-color: ${theme.borderColor.tertiary};
      z-index: 3;
    }
  `};
`;

export default Button;
