import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';

const ul = styled.ul`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
    ${createFontStyles('body-2')};
    margin-bottom: ${theme.spacing[9]};
    margin-left: ${theme.spacing[7]};

    li {
      list-style: disc;
    }
  `}
`;

export default ul;
