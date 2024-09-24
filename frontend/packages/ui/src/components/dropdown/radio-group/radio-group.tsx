import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

const RadioGroup = styled(RadixDropdown.RadioGroup)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[2]};
  `}
`;

export default RadioGroup;
