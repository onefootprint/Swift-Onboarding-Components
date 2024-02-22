import { Divider } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const DashedLine = styled(Divider)`
  ${({ theme }) => css`
    width: auto;
    margin: ${theme.spacing[6]} -${theme.spacing[7]};
  `}
`;

export default DashedLine;
