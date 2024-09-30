import { Command } from 'cmdk';
import type * as CSS from 'csstype';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils';

type ComboItemProps = {
  children: React.ReactNode;
  value: string;
  onSelect?: (value: string) => void;
  size?: 'compact' | 'default';
  height?: CSS.Property.Height;
  disabled?: boolean;
};

const ComboItem = ({ children, value, onSelect, size = 'default', height, disabled, ...props }: ComboItemProps) => {
  return (
    <StyledCommandItem value={value} onSelect={onSelect} $size={size} $height={height} $disabled={disabled} {...props}>
      {children}
    </StyledCommandItem>
  );
};

const StyledCommandItem = styled(Command.Item)<{
  $height?: CSS.Property.Height;
  $size?: 'compact' | 'default';
  $disabled?: boolean;
}>`
  ${({ theme, $height, $size, $disabled }) => css`
    height: ${$height};
    cursor: ${$disabled ? 'inherit' : 'pointer'};
    pointer-events: ${$disabled ? 'none' : 'auto'};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    color: ${$disabled ? theme.color.quaternary : 'inherit'};

    ${
      $size === 'compact' &&
      css`
      ${createFontStyles('body-3')};
      padding: ${theme.spacing[2]} ${theme.spacing[4]};
    `
    }

    ${
      $size === 'default' &&
      css`
      ${createFontStyles('body-2')};
      padding: ${theme.spacing[3]} ${theme.spacing[4]};
    `
    }

    &:hover {
      background-color: ${$disabled ? 'transparent' : theme.backgroundColor.secondary};
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default ComboItem;
