import { styled } from 'styled-components';
import { css } from 'styled-components';
import { createFontStyles } from '../../../utils';
import Box from '../../box';
import { DROPDOWN_ITEM_SIZE } from '../dropdown.types';

const BaseItemContainer = styled(Box)<{
  variant?: 'default' | 'destructive';
  size?: 'default' | 'compact' | 'tiny';
  layout?: 'default' | 'radio-item';
  $height?: string | 'fit-content';
}>`
  ${({ theme, variant = 'default', size = 'default', $height, layout = 'default' }) => {
    const getHeight = () => {
      if ($height === 'fit-content') return 'fit-content';
      if ($height) return $height;
      return DROPDOWN_ITEM_SIZE[size || 'default'];
    };

    return css`
      ${createFontStyles('body-3')};
      position: relative;
      display: ${layout === 'radio-item' ? 'grid' : 'flex'};
      ${
        layout === 'radio-item'
          ? css`
          grid-template-columns: 1fr ${theme.spacing[4]};
          grid-template-rows: 1fr;
        `
          : css`
          flex-direction: row;
         
        `
      }
      gap: ${theme.spacing[3]};  
      align-items: center;
      width: 100%;
      height: ${getHeight()};
      padding: ${theme.spacing[2]} ${theme.spacing[4]};
      overflow: hidden;
      color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
      cursor: pointer;
      border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[1]});

      a {
        color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
        text-decoration: none;
      }
      
      button {
        all: unset;
      }

      &:hover, &:focus {
        background-color: ${theme.backgroundColor.secondary};
        outline: none;
      }

      &:focus-visible:not(:hover) {
        background-color: ${theme.backgroundColor.primary};
        outline: ${theme.borderWidth[1]} solid ${theme.borderColor.secondary};
      }

      &[data-disabled] {
        color: ${theme.color.quaternary};
        cursor: auto;
        user-select: none;

        &:hover {
          background: none;
        }
      }

      ${
        size === 'compact' &&
        css`
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        ${createFontStyles('body-3')};
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

export default BaseItemContainer;
