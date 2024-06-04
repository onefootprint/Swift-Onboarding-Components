import type { Theme } from '@onefootprint/design-tokens';
import { createFontStyles, Stack } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css, useTheme } from 'styled-components';

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
  groupId?: string;
};

const buttonVariants = (theme: Theme) => ({
  selected: {
    color: theme.color.quinary,
    backgroundColor: theme.backgroundColor.transparent,
  },
  unselected: {
    backgroundColor: theme.backgroundColor.transparent,
    color: theme.color.primary,
    cursor: 'pointer',
  },
  disabled: {
    backgroundColor: theme.backgroundColor.transparent,
    color: theme.color.quaternary,
  },
});

const ToggleGroup = ({
  'aria-label': ariaLabel,
  options,
  value,
  onChange,
  disabled,
  groupId,
}: ToggleGroupProps) => {
  const theme = useTheme();

  const getAnimate = (option: ToggleGroupOption) => {
    if (disabled) return 'disabled';
    if (value === option.value) return 'selected';
    return 'unselected';
  };

  return (
    <ToggleGroupContainer
      aria-label={ariaLabel}
      data-disabled={disabled}
      role="radiogroup"
    >
      {options.map(option => (
        <Stack
          position="relative"
          key={option.value}
          height="100%"
          align="center"
          justify="center"
        >
          <Option
            disabled={disabled}
            data-selected={value === option.value}
            onClick={() => {
              onChange?.(option.value);
            }}
            variants={buttonVariants(theme)}
            initial="unselected"
            animate={getAnimate(option)}
          >
            {option.label}
            {option.count ? (
              <Badge data-selected={value === option.value}>
                {option.count}
              </Badge>
            ) : null}
          </Option>
          {value === option.value && (
            <SelectedIndicator
              key={value}
              layoutId={groupId}
              transition={{
                duration: 0.12,
                type: 'tween',
              }}
            />
          )}
        </Stack>
      ))}
    </ToggleGroupContainer>
  );
};

const SelectedIndicator = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[1]};
    left: ${theme.spacing[1]};
    right: ${theme.spacing[1]};
    bottom: ${theme.spacing[1]};
    width: calc(100% - ${theme.spacing[1]} * 2);
    height: calc(100% - ${theme.spacing[1]} * 2);
    background-color: ${theme.backgroundColor.tertiary};
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
    user-select: none;
    z-index: -1;
  `}
`;

const ToggleGroupContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 32px;
  `}
`;

const Option = styled(motion.button)`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    border: unset;
    height: calc(100% - ${theme.spacing[1]} * 2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[2]};
    padding: 0 ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.sm};
    z-index: 1;

    &:hover {
      &:not([data-selected='true']):not(:disabled) {
        &::before {
          content: '';
          position: absolute;
          top: ${theme.spacing[1]};
          left: ${theme.spacing[1]};
          right: ${theme.spacing[1]};
          bottom: ${theme.spacing[1]};
          width: calc(100% - ${theme.spacing[1]} * 2);
          height: calc(100% - ${theme.spacing[1]} * 2);
          background-color: ${theme.backgroundColor.secondary};
          border-radius: calc(
            ${theme.borderRadius.default} - ${theme.spacing[1]}
          );
          z-index: -1;
        }
      }
    }
  `}
`;

const Badge = styled(motion.div)<{ 'data-selected': boolean }>`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    align-items: center;
    display: inline-flex;
    justify-content: center;
    min-width: 20px;
    height: calc(100% - ${theme.spacing[1]} * 2);
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.sm};
    background: ${theme.backgroundColor.secondary};
    color: ${theme.color.quaternary};

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
