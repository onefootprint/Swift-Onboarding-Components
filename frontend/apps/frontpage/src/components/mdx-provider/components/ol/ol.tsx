import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';

const ol = styled.ol`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};
    margin-left: ${theme.spacing[7]};

    li {
      list-style: octal;
    }

    ol li {
      list-style: lower-alpha;
    }
  `}
`;

export default ol;
