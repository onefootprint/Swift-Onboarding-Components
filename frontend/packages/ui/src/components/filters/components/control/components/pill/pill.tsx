import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../../../utils/mixins';

export type PillProps = {
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?:
    | boolean
    | 'grid'
    | 'dialog'
    | 'menu'
    | 'true'
    | 'false'
    | 'listbox'
    | 'tree';
  children?: React.ReactNode;
  label?: () => void;
  onClick?: () => void;
};

const Pill = styled.button<PillProps>`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    align-items: center;
    background: ${theme.backgroundColor.primary};
    border-color: ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
    border-width: ${theme.borderWidth[1]};
    border-style: solid;
    color: ${theme.color.tertiary};
    cursor: pointer;
    display: flex;
    display: flex;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    white-space: nowrap;

    @media (hover: hover) {
      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }
  `}
`;

export default Pill;
