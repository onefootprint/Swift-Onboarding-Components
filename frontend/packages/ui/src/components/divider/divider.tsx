import styled, { css } from 'styled-components';

const Divider = styled.div.attrs({
  role: 'separator',
  'aria-orientation': 'horizontal',
})`
  ${({ theme }) => css`
    background-color: ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]};
    opacity: 1;
    border-width: 0px 0px ${theme.borderWidth[1]};
    border-image: initial;
    border-color: ${theme.borderColor.tertiary};
    border-style: solid;
    width: 100%;
  `}
`;

export default Divider;
