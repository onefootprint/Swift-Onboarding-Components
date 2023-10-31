import styled, { css } from '@onefootprint/styled';

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
  disabled?: boolean;
  label?: () => void;
  onClick?: () => void;
};

const Pill = styled.button<PillProps>`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    align-items: center;
    border-color: ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    border-width: ${theme.borderWidth[1]};
    border-style: solid;
    color: ${theme.color.secondary};
    display: flex;
    display: flex;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    white-space: nowrap;
    height: 32px;

    &:enabled {
      cursor: pointer;
      background: ${theme.backgroundColor.primary};
    }

    &:disabled {
      background: ${theme.backgroundColor.secondary};
    }

    @media (hover: hover) {
      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }
  `}
`;

export default Pill;
