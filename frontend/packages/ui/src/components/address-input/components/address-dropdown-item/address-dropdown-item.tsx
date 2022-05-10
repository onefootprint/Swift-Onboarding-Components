import React, { forwardRef } from 'react';
import Highlighter from 'react-highlight-words';
import styled, { css, useTheme } from 'styled';

import Typography from '../../../typography';

export type AddressDropdownItemProps = {
  ariaSelected: boolean;
  disableHoverStyles: boolean;
  highlighted: boolean;
  id?: string;
  onClick: (event: React.MouseEvent<HTMLLIElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLLIElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLLIElement>) => void;
  searchWords: string[];
  subtitle: string;
  title: string;
};

const AddressDropdownItem = forwardRef<HTMLLIElement, AddressDropdownItemProps>(
  (
    {
      ariaSelected,
      disableHoverStyles,
      highlighted,
      id,
      onClick,
      onKeyDown,
      onMouseMove,
      searchWords,
      subtitle,
      title,
    }: AddressDropdownItemProps,
    ref,
  ) => {
    const theme = useTheme();
    return (
      <Container
        aria-selected={ariaSelected}
        disableHoverStyles={disableHoverStyles}
        highlighted={highlighted}
        id={id}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        ref={ref}
        role="option"
      >
        <Typography variant="body-3" color="primary">
          <Highlighter
            searchWords={searchWords}
            textToHighlight={title}
            highlightStyle={{
              background: 'none',
              color: theme.color.primary,
              fontWeight: theme.typography['label-3'].fontWeight,
            }}
          />
        </Typography>
        <Typography variant="body-3" color="tertiary">
          {subtitle}
        </Typography>
      </Container>
    );
  },
);

const Container = styled.li<{
  highlighted: boolean;
  disableHoverStyles: boolean;
}>`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    cursor: pointer;
    margin-bottom: ${theme.spacing[2]}px;
    padding: ${theme.spacing[2]}px ${theme.spacing[5]}px;

    > p:first-child {
      margin-bottom: ${theme.spacing[2]}px;
    }
  `}

  ${({ theme, disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      &:hover {
        background: linear-gradient(
            ${theme.overlay.darken[1]},
            ${theme.overlay.darken[1]}
          ),
          linear-gradient(
            ${theme.backgroundColor.primary},
            ${theme.backgroundColor.primary}
          );
      }
    `}

  ${({ theme, highlighted }) =>
    highlighted &&
    css`
      background: linear-gradient(
          ${theme.overlay.darken[1]},
          ${theme.overlay.darken[1]}
        ),
        linear-gradient(
          ${theme.backgroundColor.primary},
          ${theme.backgroundColor.primary}
        );
    `}
`;

export default AddressDropdownItem;
