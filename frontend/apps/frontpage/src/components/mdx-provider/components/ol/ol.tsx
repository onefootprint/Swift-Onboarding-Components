import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const ol = styled.ol`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
    font: ${createFontStyles('body-2')};
    margin-left: ${theme.spacing[7]}px;

    li {
      list-style: octal;
    }

    ol li {
      list-style: lower-alpha;
    }
  `}
`;

export default ol;
