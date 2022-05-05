import React, { forwardRef } from 'react';
import styled, { css } from 'styled';

import Typography from '../../../typography';
import TypographyHighlight from '../../../typography-highlight';

export type AddressDropdownItemProps = {
  ariaSelected: boolean;
  disableHoverStyles: boolean;
  highlighted: boolean;
  id?: string;
  matchedText: { length: number; offset: number }[];
  onClick: (event: React.MouseEvent<HTMLLIElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLLIElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLLIElement>) => void;
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
      matchedText,
      onClick,
      onKeyDown,
      onMouseMove,
      subtitle,
      title,
    }: AddressDropdownItemProps,
    ref,
  ) => (
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
      <TypographyHighlight matchedText={matchedText}>
        {title}
      </TypographyHighlight>
      <Typography variant="body-3" color="tertiary">
        {subtitle}
      </Typography>
    </Container>
  ),
);

const Container = styled.li<{
  highlighted: boolean;
  disableHoverStyles: boolean;
}>`
  ${({ theme }) => css`
    background: ${theme.backgroundColors.primary};
    cursor: pointer;
    margin-bottom: ${theme.spacings[2]}px;
    padding: ${theme.spacings[2]}px ${theme.spacings[5]}px;

    > p:first-child {
      margin-bottom: ${theme.spacings[2]}px;
    }
  `}

  ${({ theme, disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      &:hover {
        background: linear-gradient(
            ${theme.overlays.darken[1]},
            ${theme.overlays.darken[1]}
          ),
          linear-gradient(
            ${theme.backgroundColors.primary},
            ${theme.backgroundColors.primary}
          );
      }
    `}

  ${({ theme, highlighted }) =>
    highlighted &&
    css`
      background: linear-gradient(
          ${theme.overlays.darken[1]},
          ${theme.overlays.darken[1]}
        ),
        linear-gradient(
          ${theme.backgroundColors.primary},
          ${theme.backgroundColors.primary}
        );
    `}
`;

export default AddressDropdownItem;
