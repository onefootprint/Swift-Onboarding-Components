import styled, { css } from '@onefootprint/styled';

export type DividerProps = {};

const Divider = styled.View<DividerProps>`
  ${({ theme }) => css`
    background-color: ${theme.borderColor.primary};
    height: ${theme.borderWidth[1]};
  `}
`;

export default Divider;
