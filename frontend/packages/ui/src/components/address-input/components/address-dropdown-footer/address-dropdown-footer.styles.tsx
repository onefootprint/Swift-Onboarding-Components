import styled, { css } from 'styled';

const Container = styled.li`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColors.secondary};
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacings[3]}px;
    padding: ${theme.spacings[4]}px 0;
    border-top: ${theme.borderWidths[1]}px solid ${theme.dividerColors.primary};
  `}
`;

export default { Container };
