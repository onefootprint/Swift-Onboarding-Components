import { forwardRef, useState } from 'react';
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

export const triggerWidths: Record<ButtonSize, string> = {
  compact: '24px',
  default: '32px',
  large: '40px',
};

const Button = forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      disabled = false,
      loading = false,
      type = 'button',
      variant = 'secondary',
      size = 'default',
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
          loadingAriaLabel="Loading"
          onClick={activeOption.onSelect}
          ref={ref}
          size={size}
          tab-index={0}
          type={type}
          variant={variant}
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
          $width={triggerWidths[size]}
          tab-index={1}
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
      border: ${button.borderWidth} solid
        ${button.variant[$variant].borderColor};
      overflow: hidden;
      box-shadow: ${button.variant[$variant].boxShadow};

      &::after {
        content: '';
        position: absolute;
        top: 0;
        height: 100%;
        width: ${theme.borderWidth[1]};
        right: ${triggerWidths[$size]};
        background-color: ${button.variant[$variant].borderColor};
        z-index: 2;
      }
    `;
  }}
`;

export default Button;
