import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type ToggleGroupOption = {
  value: string;
  label: string;
  count?: number;
};

export type ToggleGroupProps = {
  'aria-label'?: string;
  options: ToggleGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const ToggleGroup = ({
  'aria-label': ariaLabel,
  options,
  value,
  onChange,
  disabled,
}: ToggleGroupProps) => (
  <ToggleGroupContainer
    aria-label={ariaLabel}
    data-disabled={disabled}
    role="radiogroup"
  >
    {options.map(option => (
      <Option
        disabled={disabled}
        key={option.value}
        data-selected={value === option.value}
        onClick={() => {
          onChange?.(option.value);
        }}
      >
        {option.label}
        {option.count ? (
          <Badge data-selected={value === option.value}>{option.count}</Badge>
        ) : null}
      </Option>
    ))}
  </ToggleGroupContainer>
);

const ToggleGroupContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    height: 32px;

    &[data-disabled='false'] {
      background-color: ${theme.backgroundColor.primary};
    }

    &[data-disabled='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const Option = styled.button`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    background-color: unset;
    border: unset;
    height: 28px;
    margin: 1px;
    padding: 0 ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.sm};

    &:enabled {
      cursor: pointer;
    }

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &:disabled {
      color: ${theme.color.quaternary};
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.tertiary};
      color: ${theme.color.quinary};
    }
  `}
`;

const Badge = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.sm};
    color: ${theme.color.quaternary};
    display: inline-flex;
    height: ${theme.spacing[7]};
    justify-content: center;
    margin-left: ${theme.spacing[3]};
    min-width: 20px;
    padding: ${theme.spacing[1]} ${theme.spacing[2]};

    &[data-selected='false'] {
      background-color: ${theme.backgroundColor.secondary};
      color: ${theme.color.quaternary};
    }

    &[data-selected='true'] {
      color: ${theme.color.quinary};
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.1) 100%
        ),
        ${theme.backgroundColor.tertiary};
    }
  `}
`;

export default ToggleGroup;
