import styled, { css } from 'styled';

const Container = styled.li`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing[3]}px;
    padding: ${theme.spacing[4]}px 0;
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
  `}
`;

export default { Container };
