import styled, { css } from 'styled-components';

const Divider = styled.div.attrs({
  role: 'separator',
  'aria-orientation': 'vertical',
})`
  ${({ theme }) => css`
    background-color: ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]};
  `}
`;

export default Divider;
