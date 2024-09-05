import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils';

import { DROPDOWN_ITEM_SIZE } from '../../dropdown.types';

const SubTrigger = styled(RadixDropdown.SubTrigger)<{
  $asButton?: boolean;
  size?: 'default' | 'compact' | 'tiny';
}>`
  ${({ theme, size = 'default' }) => {
    return css`
      ${createFontStyles('body-3')};
      height: ${DROPDOWN_ITEM_SIZE.default};
      all: unset;
      align-items: center;
      background: ${theme.backgroundColor.transparent};
      border-radius: ${theme.borderRadius.sm};
      border: none;
      cursor: pointer;
      display: flex;
      position: relative;
      justify-content: flex-start;
      padding: ${theme.spacing[2]} ${theme.spacing[4]};


      &[data-state='open'] {
        position: relative;
        background-color: ${theme.backgroundColor.senary};
      }

      &[data-state='closed']:hover {
        background-color: ${theme.backgroundColor.secondary};
      }

      &[data-disabled] {
        cursor: initial;
        opacity: 0.5;
      }

      ${
        size === 'compact' &&
        css`
          ${createFontStyles('caption-4')};
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          height: ${DROPDOWN_ITEM_SIZE.compact};
        `
      }

      ${
        size === 'tiny' &&
        css`
          ${createFontStyles('caption-4')};
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
          height: ${DROPDOWN_ITEM_SIZE.tiny};
        `
      }
    `;
  }}
`;

export default SubTrigger;
