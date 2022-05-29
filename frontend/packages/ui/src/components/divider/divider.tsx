import styled, { css } from 'styled';

const Divider = styled.div.attrs({
  role: 'separator',
  'aria-orientation': 'vertical',
})`
  ${({ theme }) => css`
    background-color: ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]}px;
  `}
`;

export default Divider;
