import type { Color } from '@onefootprint/design-tokens';
import { IcoChevronDown16 } from '@onefootprint/icons';
import { Stack, createFontStyles } from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

type CustomTriggerProps = {
  isOpen: boolean;
  children: string;
  ariaLabel: string;
  color?: Color;
};

const CustomTrigger: React.FC<CustomTriggerProps> = ({ isOpen, children, ariaLabel, color = 'primary' }) => {
  const hoverRef = useRef<HTMLButtonElement>(null);
  const isHovered = useHover(hoverRef);

  return (
    <Trigger
      role="button"
      aria-label={ariaLabel}
      type="button"
      ref={hoverRef}
      data-is-hovered={isHovered}
      color={color}
    >
      <>
        {children}
        <ChevronContainer data-open={isOpen} align="center" justify="center" data-is-hovered={isHovered}>
          <IcoChevronDown16 color={isHovered ? 'primary' : 'secondary'} />
        </ChevronContainer>
      </>
    </Trigger>
  );
};

const Trigger = styled(SelectPrimitive.Trigger)`
  ${({ theme, color }) => css`
    ${createFontStyles('caption-1')};
    padding: 0 ${theme.spacing[1]} 0 ${theme.spacing[2]};
    color: ${theme.color[color as Color]};
    align-items: center;
    border-radius: ${theme.borderRadius.full};
    border: 0;
    gap: ${theme.spacing[2]};
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    background-color: ${theme.backgroundColor.primary};
    width: fit-content;

    &[data-is-hovered='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const ChevronContainer = styled(Stack)`
  ${({ theme }) => css`
    transition: transform 0.1s ease-in-out;
    transform-origin: center;
    transform: rotate(0deg);

    &[data-open='true'] {
      transform: rotate(180deg);
    }

    &[data-is-hovered='true'] {
      color: ${theme.backgroundColor.tertiary};
    }
  `}
`;

export default CustomTrigger;
