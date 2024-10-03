import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const Group = forwardRef<HTMLDivElement, RadixDropdown.DropdownMenuGroupProps>((props, ref) => {
  return <StyledGroup {...props} ref={ref} />;
});

const StyledGroup = styled(RadixDropdown.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]};
  `}
`;

export default Group;
