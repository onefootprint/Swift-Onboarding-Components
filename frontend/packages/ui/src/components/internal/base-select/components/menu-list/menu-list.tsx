import React from 'react';
import type { CommonPropsAndClassName, GroupBase } from 'react-select';
import { FixedSizeList as List } from 'react-window';
import styled, { css } from 'styled-components';

const OPTION_HEIGHT = 36;
const ROWS = 6;

export type MenuListProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = CommonPropsAndClassName<Option, IsMulti, Group> & {
  children: React.ReactNode[];
  innerRef: React.RefCallback<HTMLDivElement>;
};

const MenuList = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({
  innerRef,
  options,
  children,
  getValue,
}: MenuListProps<Option, IsMulti, Group>) => {
  const [value] = getValue();

  const getInitialOffset = () => {
    if (options.indexOf(value) !== -1) {
      if (Array.isArray(children) && children.length >= ROWS) {
        if (options.indexOf(value) >= ROWS) {
          return options.indexOf(value) * OPTION_HEIGHT - OPTION_HEIGHT * 5;
        }
      }
    }
    return 0;
  };

  const height =
    children.length >= ROWS
      ? OPTION_HEIGHT * ROWS
      : children.length * OPTION_HEIGHT;

  return Array.isArray(children) ? (
    <StyledList
      height={height}
      initialScrollOffset={getInitialOffset()}
      itemCount={children.length}
      itemSize={OPTION_HEIGHT}
      width="100%"
    >
      {({ style, index }) => <div style={style}>{children[index]}</div>}
    </StyledList>
  ) : (
    <div ref={innerRef}>{children}</div>
  );
};

const StyledList = styled(List)`
  ${({ theme }) => css`
    margin: ${theme.spacing[3]}px 0;
  `}
`;

export default MenuList;
