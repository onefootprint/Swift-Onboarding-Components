import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { motion } from 'framer-motion';
import React, { forwardRef, useContext } from 'react';

import { createFontStyles } from '../../../../utils';
import TabContext from '../context';

export type TabProps = {
  as?: React.ComponentType<any> | string;
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  selected?: boolean;
  icon?: Icon;
};

const Tab = forwardRef<HTMLAnchorElement, TabProps>(
  (
    { as, children, href, onClick, selected = false, icon: Icon }: TabProps,
    ref,
  ) => {
    const renderedIcon = Icon && <Icon />;
    const { variant, layoutId } = useContext(TabContext);

    return (
      <TabContainer
        aria-selected={selected}
        as={as}
        data-selected={!!selected}
        href={href}
        onClick={onClick}
        ref={ref}
        role="tab"
        tabIndex={0}
        data-variant={variant}
      >
        <Label selected={selected} data-variant={variant} className="label">
          {variant === 'pill' && renderedIcon && (
            <IconContainer selected={selected}>{renderedIcon}</IconContainer>
          )}
          {children}
        </Label>
        {selected && (
          <ActiveMarker layoutId={layoutId} data-variant={variant} />
        )}
      </TabContainer>
    );
  },
);

const IconContainer = styled.div<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${theme.spacing[6]};
    height: ${theme.spacing[6]};

    svg path {
      transition: all 0.5s ease;
      fill: ${selected ? theme.color.quinary : theme.color.primary};
    }
  `}
`;

const Label = styled.div<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    ${createFontStyles('body-4')}
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    gap: ${theme.spacing[2]};
    transition: all 0.5s ease;

    &[data-variant='pill'] {
      color: ${selected ? theme.color.quinary : theme.color.primary};
    }

    &[data-variant='underlined'] {
      color: ${selected ? theme.color.accent : theme.color.tertiary};
    }
  `}
`;

const TabContainer = styled.a`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: center;
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    transition: background-color 0.5s ease;

    &[data-variant='underlined'] {
      margin-right: ${theme.spacing[5]};

      @media (hover: hover) {
        &:hover {
          .label {
            color: ${theme.color.secondary};
          }
        }
      }
    }

    &[data-variant='pill'] {
      border-radius: ${theme.borderRadius.full};
      background-color: ${theme.backgroundColor.transparent};
      @media (hover: hover) {
        &:hover {
          background-color: ${theme.backgroundColor.senary};
        }
      }
    }
  `}
`;

const ActiveMarker = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;

    &[data-variant='pill'] {
      height: 100%;
      border-radius: ${theme.borderRadius.full};
      z-index: 0;
      pointer-events: none;
      background-color: ${theme.backgroundColor.accent};
    }

    &[data-variant='underlined'] {
      height: ${theme.borderWidth[2]};
      background-color: ${theme.color.accent};
      bottom: calc(${theme.borderWidth[2]} * -1);
    }
  `}
`;

export default Tab;
