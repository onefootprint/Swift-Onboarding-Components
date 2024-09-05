import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

const SubContent = styled(RadixDropdown.SubContent)<{
  $minWidth?: string;
  $maxWidth?: string;
}>`
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
