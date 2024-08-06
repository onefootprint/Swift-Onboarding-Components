import { Children } from 'react';
import type { MenuListProps } from 'react-select';
import { FixedSizeList as List } from 'react-window';
import styled, { css } from 'styled-components';

const OPTION_HEIGHT = 36;
const ROWS = 6;
const MARGIN = 8;

const MenuList = ({ innerRef, options, children, getValue }: MenuListProps) => {
  const [value] = getValue();
  const length = Children.count(children);

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

  const height = length >= ROWS ? OPTION_HEIGHT * ROWS - MARGIN : length * OPTION_HEIGHT + 2 * MARGIN;

  return Array.isArray(children) ? (
    <StyledList
      height={height}
      initialScrollOffset={getInitialOffset()}
      itemCount={length}
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
    & > div > div {
      margin: ${theme.spacing[3]} 0 0 0;
    }
  `}
`;

export default MenuList;
