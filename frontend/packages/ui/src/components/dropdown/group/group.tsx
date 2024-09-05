import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

const Group = styled(RadixDropdown.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]};
  `}
`;

export default Group;
