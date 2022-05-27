import styled, { css } from 'styled';

const ul = styled.ul`
  ${({ theme }) => {
    const font = theme.typography['body-2'];
    return css`
      color: ${theme.color.secondary};
      font-family: ${font.fontFamily};
      font-size: ${font.fontSize};
      font-weight: ${font.fontWeight};
      line-height: ${font.lineHeight};
      margin-bottom: ${theme.spacing[9]}px;
      margin-left: ${theme.spacing[7]}px;

      li {
        list-style: disc;
      }
    `;
  }}
`;

export default ul;
