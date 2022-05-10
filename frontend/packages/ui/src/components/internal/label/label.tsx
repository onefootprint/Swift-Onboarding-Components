import styled, { css } from 'styled';

const Label = styled.label`
  ${({ theme }) => css`
    color: ${theme.color.primary};
    display: inline-block;
    font-family: ${theme.typography['body-3'].fontFamily};
    font-size: ${theme.typography['body-3'].fontSize}px;
    font-weight: ${theme.typography['body-3'].fontWeight};
    line-height: ${theme.typography['body-3'].lineHeight}px;
    margin-bottom: ${theme.spacing[3]}px;
  `}
`;

export default Label;
