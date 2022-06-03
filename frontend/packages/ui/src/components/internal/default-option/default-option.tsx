import IcoCheck16 from 'icons/ico/ico-check-16';
import React, { memo } from 'react';
import Highlighter from 'react-highlight-words';
import styled, { css, useTheme } from 'styled';

import {
  createFontStyles,
  createOverlayBackground,
} from '../../../utils/mixins';

export type DefaultOptionProps = {
  disableHoverStyles: boolean;
  highlighted: boolean;
  label: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onMouseMove?: React.MouseEventHandler<HTMLElement>;
  searchWords: string[];
  selected: boolean;
  prefixComponent?: React.ReactNode;
};

const DefaultOption = ({
  disableHoverStyles,
  highlighted,
  label,
  onClick,
  onMouseDown,
  onMouseMove,
  searchWords,
  selected,
  prefixComponent: PrefixComponent,
}: DefaultOptionProps) => {
  const theme = useTheme();
  return (
    <Container
      aria-selected={selected}
      disableHoverStyles={disableHoverStyles}
      highlighted={highlighted}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      role="option"
    >
      <Content>
        {PrefixComponent}
        <Highlighter
          searchWords={searchWords}
          textToHighlight={label}
          highlightStyle={{
            background: 'none',
            color: theme.color.primary,
            fontWeight: theme.typography['label-3'].fontWeight,
          }}
        >
          {label}
        </Highlighter>
      </Content>
      {selected && <IcoCheck16 color="primary" />}
    </Container>
  );
};

const Container = styled('li')<{
  disableHoverStyles: boolean;
  highlighted: boolean;
}>`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    background: ${theme.backgroundColor.primary};
    color: ${theme.color.secondary};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[2]}px;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `}

  ${({ disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      &:hover {
        ${createOverlayBackground('darken-1', 'primary')};
      }
    `}

  ${({ highlighted }) =>
    highlighted &&
    css`
      ${createOverlayBackground('darken-1', 'primary')};
    `}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
`;

export default memo(DefaultOption, (prevProps, nextProps) => {
  if (prevProps.highlighted !== nextProps.highlighted) return false;
  if (prevProps.searchWords !== nextProps.searchWords) return false;
  if (prevProps.selected !== nextProps.selected) return false;
  return true;
});
