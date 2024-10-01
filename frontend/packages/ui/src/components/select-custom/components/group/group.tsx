import * as RadixSelect from '@radix-ui/react-select';
import styled, { css } from 'styled-components';

const Group = styled(RadixSelect.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]};
  `}
`;

export default Group;
