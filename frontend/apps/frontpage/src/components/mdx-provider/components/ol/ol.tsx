import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';

const ol = styled.ol`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
    font: ${createFontStyles('body-2')};
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
