import styled, { css } from 'styled';

const Label = styled.label`
  ${({ theme }) => css`
    color: ${theme.colors.primary};
    font-family: ${theme.typographies['body-3'].fontFamily};
    font-size: ${theme.typographies['body-3'].fontSize}px;
    font-weight: ${theme.typographies['body-3'].fontWeight};
    line-height: ${theme.typographies['body-3'].lineHeight}px;
    margin-bottom: ${theme.spacings[3]}px;
  `}
`;

export default Label;
