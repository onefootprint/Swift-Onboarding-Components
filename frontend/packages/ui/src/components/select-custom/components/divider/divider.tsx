import styled, { css } from 'styled-components';

const Divider = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]};
    box-sizing: border-box;
  `}
`;

export default Divider;
