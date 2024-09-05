import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../utils';

const GroupTitle = styled(RadixDropdown.Label)`
  ${({ theme }) => css`
    ${createFontStyles('caption-3')};
    text-transform: uppercase;
    color: ${theme.color.quaternary};
    display: flex;
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[2]};
  `};
`;

export default GroupTitle;
