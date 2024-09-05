import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { IcoArrowTopRight16, IcoCheckSmall16 } from '@onefootprint/icons';
import { createFontStyles } from '../../../utils';

import type { ItemProps } from '../dropdown.types';

import { DROPDOWN_ITEM_SIZE } from '../dropdown.types';

const Item = ({
  iconLeft: IconLeft,
  iconRight,
  children,
  checked,
  asLink,
  size,
  variant,
  height,
  ...props
}: ItemProps) => {
  const IconRight = asLink ? StyledIcoArrowTopRight16 : iconRight;
  return (
    <StyledDropdownItem size={size} variant={variant} $height={height} {...props}>
      {IconLeft && <IconLeft />}
      <Content>{children}</Content>
      {IconRight && <IconRight />}
      {checked && <CheckIcon />}
    </StyledDropdownItem>
  );
};

const CheckIcon = styled(IcoCheckSmall16)`
  ${({ theme }) => css`
    color: ${theme.color.primary};
    position: absolute;
    right: ${theme.spacing[3]};
    top: ${theme.spacing[3]};
  `}
`;

const StyledDropdownItem = styled(RadixDropdown.Item)<{
  variant?: 'default' | 'destructive';
  size?: 'default' | 'compact' | 'tiny';
  $height?: string | 'fit-content';
}>`
  ${({ theme, variant, size, $height }) => {
    const getHeight = () => {
      if ($height === 'fit-content') return 'fit-content';
      if ($height) return $height;
      return DROPDOWN_ITEM_SIZE[size || 'default'];
    };

    return css`
      ${createFontStyles('body-3')};
      cursor: pointer;
      display: flex;
      justify-content: left;
      align-items: center;
      flex: 1;
      position: relative;
      flex-wrap: nowrap;
      overflow: hidden;
      gap: ${theme.spacing[2]};
      color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
      padding: ${theme.spacing[2]} ${theme.spacing[4]};
      border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});
      height: ${getHeight()};
      width: 100%;

      a {
        text-decoration: none;
        color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
      }
      
      button {
        all: unset;
        text-decoration: none;
      }

      &:hover, &:focus {
        outline: none;
        background-color: ${theme.backgroundColor.secondary};
      }

      &:focus-visible:not(:hover) {
        background-color: ${theme.backgroundColor.primary};
        outline: ${theme.borderWidth[1]} solid ${theme.borderColor.secondary};
      }

      &[data-disabled] {
        user-select: none;
        cursor: auto;
        color: ${theme.color.quaternary};

        &:hover {
          background: none;
        }
      }

      ${
        size === 'compact' &&
        css`
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          ${createFontStyles('body-4')};
        `
      }

      ${
        size === 'tiny' &&
        css`
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
          ${createFontStyles('caption-2')};
        `
      }
    `;
  }}
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    text-decoration: none;
    flex-direction: column;
    gap: ${theme.spacing[1]};
  `}
`;

const StyledIcoArrowTopRight16 = styled(IcoArrowTopRight16)`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

export default Item;
