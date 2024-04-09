import type { ComponentProps } from 'react';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import Stack from '../../../stack';
import Text from '../../../text';

type TabContainerProps = ComponentProps<typeof TabContainer>;

export type TabProps = {
  as?: React.ComponentType<TabContainerProps> | string;
  children: React.ReactNode;
  href?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: React.MouseEventHandler<any>;
  selected?: boolean;
};
const Tab = forwardRef<HTMLAnchorElement, TabProps>(
  ({ as, children, href, onClick, selected = false }, ref) => (
    <TabContainer
      aria-selected={selected}
      as={as}
      data-selected={!!selected}
      /** @ts-ignore */
      href={href}
      onClick={onClick}
      /** @ts-ignore */
      ref={ref}
      role="tab"
      tabIndex={0}
      key={href}
      align="center"
      justify="center"
      selected={selected}
    >
      <Label
        variant="body-3"
        selected={selected}
        color={selected ? 'accent' : 'tertiary'}
        tag="p"
      >
        {children}
      </Label>
      {selected && <ActiveMarker />}
    </TabContainer>
  ),
);

const TabContainer = styled(Stack)<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    position: relative;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} 0;
    transition: background-color 0.5s ease;
    height: ${theme.spacing[9]};
    cursor: pointer;

    ${!selected &&
    css`
      &:hover {
        p {
          color: ${theme.color.secondary};
          &::after {
            content: '';
            position: absolute;
            background-color: ${theme.backgroundColor.secondary};
            border-radius: ${theme.borderRadius.sm};
            z-index: -1;
            top: -${theme.spacing[2]};
            bottom: -${theme.spacing[2]};
            left: -${theme.spacing[3]};
            right: -${theme.spacing[3]};
          }
        }
      }
    `}
  `}
`;

const Label = styled(Text)<{ selected: boolean }>`
  ${({ theme }) => css`
    position: relative;
    display: inline-flex;
    z-index: 1;
    gap: ${theme.spacing[2]};
    transition: all 0.2s ease;
  `}
`;

const ActiveMarker = styled.div`
  ${({ theme }) => css`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${theme.borderWidth[2]};
    background-color: ${theme.color.accent};
    bottom: calc(${theme.borderWidth[2]} * -1);
  `}
`;

export default Tab;
