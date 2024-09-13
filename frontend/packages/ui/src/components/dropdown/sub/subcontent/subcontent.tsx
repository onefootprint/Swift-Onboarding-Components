import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import type * as CSS from 'csstype';
import styled, { css } from 'styled-components';
import type { SubContentProps } from '../../dropdown.types';

const SubContent = ({ maxWidth, minWidth, ...props }: SubContentProps) => {
  return <Container sideOffset={4} {...props} $maxWidth={maxWidth} $minWidth={minWidth} />;
};

const Container = styled(RadixDropdown.SubContent)<
  Omit<SubContentProps, 'maxWidth' | 'minWidth'> & {
    $maxWidth?: CSS.Property.Width;
    $minWidth?: CSS.Property.Width;
  }
>`
  ${({ theme, $minWidth, $maxWidth }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[3]};
    z-index: ${theme.zIndex.dropdown};
    min-width: ${$minWidth};
    max-width: ${$maxWidth};
  `}
`;

export default SubContent;
