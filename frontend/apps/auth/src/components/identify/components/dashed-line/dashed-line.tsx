import styled, { css } from '@onefootprint/styled';
import { Divider } from '@onefootprint/ui';

const DashedLine = styled(Divider)`
  ${({ theme }) => css`
    width: auto;
    margin: ${theme.spacing[4]} -${theme.spacing[7]};
  `}
`;

export default DashedLine;
