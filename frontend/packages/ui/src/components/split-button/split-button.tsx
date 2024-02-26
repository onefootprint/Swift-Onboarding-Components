import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';

import type { ButtonSize, ButtonVariant } from '../button/button.types';
import Stack from '../stack';
import type { Option } from './components/dropdown-options';
import DropdownOptions from './components/dropdown-options';
import MainButton from './components/main-button';

export type SplitButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  options: Option[];
  size?: ButtonSize;
};

const Button = forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      disabled = false,
      loading = false,
      type = 'button',
      variant = 'secondary',
      size = 'small',
      options,
    }: SplitButtonProps,
    ref,
  ) => {
    const [activeOption, setActiveOption] = useState<Option>(options[0]);

    return (
      <Container $size={size} direction="row" $variant={variant}>
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
      </Container>
    );
  },
);

const Container = styled(Stack)<{ $size: ButtonSize; $variant: ButtonVariant }>`
  ${({ theme, $size, $variant }) => {
    const { button } = theme.components;

    return css`
      position: relative;
      border-radius: ${button.borderRadius};
      height: ${button.size[$size].height};
      width: fit-content;
      border-color: ${button.variant[$variant].borderColor};
      border-style: solid;
      border-width: ${button.borderWidth};
      overflow: hidden;
      box-shadow: ${button.variant[$variant].boxShadow};
    `;
  }}
`;

export default Button;
