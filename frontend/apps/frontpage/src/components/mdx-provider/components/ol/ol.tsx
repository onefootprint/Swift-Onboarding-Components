import styled, { css } from 'styled-components';

const ol = styled.ol`
  ${({ theme }) => {
    const font = theme.typography['body-2'];
    return css`
      color: ${theme.color.secondary};
      font-family: ${font.fontFamily};
      font-size: ${font.fontSize};
      font-weight: ${font.fontWeight};
      line-height: ${font.lineHeight};
      margin-left: ${theme.spacing[7]}px;

      li {
        list-style: octal;
      }

      ol li {
        list-style: lower-alpha;
      }
    `;
  }}
`;

export default ol;
