import { CodeInline, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type DescriptionProps = {
  children: string;
};

const Description = ({ children }: DescriptionProps) => {
  const elements = [];
  let startIndex = 0;

  while (startIndex < children.length) {
    const startMarkerIndex = children.indexOf('`', startIndex);

    if (startMarkerIndex === -1) {
      elements.push(children.substring(startIndex));
      break;
    } else {
      elements.push(children.substring(startIndex, startMarkerIndex));

      const endMarkerIndex = children.indexOf('`', startMarkerIndex + 1);
      if (endMarkerIndex === -1) {
        console.error('Mismatched backticks in text');
        elements.push(children.substring(startMarkerIndex));
        break;
      } else {
        const codeText = children.substring(startMarkerIndex + 1, endMarkerIndex);
        elements.push(
          <CodeInline disabled key={endMarkerIndex}>
            {codeText}
          </CodeInline>,
        );
        startIndex = endMarkerIndex + 1;
      }
    }
  }

  return <Content>{elements}</Content>;
};

const Content = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    align-items: center;
    color: ${theme.color.secondary};
    display: inline;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-right: ${theme.spacing[2]};
  `}
`;

export default Description;
