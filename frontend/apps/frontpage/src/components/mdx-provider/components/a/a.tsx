import styled, { css } from 'styled-components';

const a = styled.a`
  ${({ theme }) => css`
    color: ${theme.color.accent};
    text-decoration: none;

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

export default a;
