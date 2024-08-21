import type React from 'react';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils/mixins';

export type AddressDropdownItemProps = {
  ariaSelected: boolean;
  disableHoverStyles: boolean;
  highlighted: boolean;
  id?: string;
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
      onClick,
      onKeyDown,
      onMouseMove,
      subtitle,
      title,
    }: AddressDropdownItemProps,
    ref,
  ) => (
    <AddressDropdownItemContainer
      data-dd-privacy="mask"
      aria-selected={ariaSelected}
      data-disable-hover-styles={disableHoverStyles}
      data-highlighted={highlighted}
      id={id}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseMove={onMouseMove}
      ref={ref}
      role="option"
    >
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </AddressDropdownItemContainer>
  ),
);

const AddressDropdownItemContainer = styled.li`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      background: ${dropdown.bg};
      cursor: pointer;
      margin-bottom: ${theme.spacing[2]};
      padding: ${theme.spacing[2]} ${theme.spacing[5]};

      > p:first-child {
        margin-bottom: ${theme.spacing[2]};
      }

      &[data-disable-hover-styles='false'] {
        @media (hover: hover) {
          &:hover {
            background: ${dropdown.hover.bg};
          }
        }
      }

      &[data-highlighted='true'] {
        background: ${dropdown.hover.bg};
      }
    `;
  }}
`;

const Title = styled.div`
  ${createFontStyles('body-3')};

  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      color: ${dropdown.colorPrimary};
    `;
  }}
`;

const Subtitle = styled.div`
  ${createFontStyles('body-3')};

  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      color: ${dropdown.colorSecondary};
    `;
  }}
`;

export default AddressDropdownItem;
