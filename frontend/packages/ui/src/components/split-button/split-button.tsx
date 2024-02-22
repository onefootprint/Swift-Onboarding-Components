'use client';

import React, { forwardRef, useState } from 'react';

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
};

const Button = forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      disabled = false,
      loading = false,
      type = 'button',
      variant = 'primary',
      options,
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
      >
        <MainButton
          disabled={disabled}
          loading={loading}
          onClick={activeOption.onSelect}
          ref={ref}
          type={type}
          variant={variant}
          tab-index="0"
        >
          {activeOption.label}
        </MainButton>
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
        />
      </Stack>
    );
  },
);

export default Button;
