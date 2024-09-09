import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../../../utils/mixins';

export type PillProps = {
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'grid' | 'dialog' | 'menu' | 'true' | 'false' | 'listbox' | 'tree';
  children?: React.ReactNode;
  disabled?: boolean;
  label?: () => void;
  onClick?: () => void;
};

const Pill = styled.button<PillProps>`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    align-items: center;
    border-color: ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    border-width: ${theme.borderWidth[1]};
    border-style: solid;
    display: flex;
    display: flex;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[3]} ${theme.spacing[3]};
    white-space: nowrap;
    height: 32px;

    &:enabled {
      cursor: pointer;
      background: ${theme.backgroundColor.primary};
      color: ${theme.color.secondary};
    }

    &:disabled {
      background: ${theme.backgroundColor.secondary};
      color: ${theme.color.quaternary};
    }

    @media (hover: hover) {
      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }
  `}
`;

export default Pill;
