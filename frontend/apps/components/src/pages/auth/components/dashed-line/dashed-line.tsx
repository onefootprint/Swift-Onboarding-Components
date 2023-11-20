import styled, { css } from '@onefootprint/styled';
import { Divider } from '@onefootprint/ui';

const DashedLine = styled(Divider)`
  ${({ theme }) => css`
    width: auto;
    margin-top: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[4]};
    margin-left: -${theme.spacing[7]};
    margin-right: -${theme.spacing[7]};
  `}
`;

export default DashedLine;
