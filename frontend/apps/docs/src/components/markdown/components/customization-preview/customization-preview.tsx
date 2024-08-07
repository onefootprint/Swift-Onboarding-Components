import { CodeBlock, Text } from '@onefootprint/ui';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import Iframe from './components/iframe';
import Option from './components/option';
import { defaultTheme, themes } from './constants/themes';
import type { Theme } from './customization-preview.types';

const CustomizationPreview = () => {
  const [selectedTheme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <Container>
      <IframeContainer>
        {themes.map(theme => (
          <Iframe key={theme.name} name={theme.name} selected={theme.name === selectedTheme.name} src={theme.src} />
        ))}
      </IframeContainer>
      <Content>
        <Text variant="label-2" marginBottom={7}>
          Customize it
        </Text>
        <SelectContainer>
          <Select>
            {themes.map(theme => (
              <Option
                image={theme.image}
                key={theme.name}
                name={theme.name}
                onClick={() => setTheme(theme)}
                selected={theme.name === selectedTheme.name}
              />
            ))}
          </Select>
        </SelectContainer>
        <CodeBlock language="javascript">{selectedTheme.code}</CodeBlock>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `};
`;

const IframeContainer = styled.div`
  ${({ theme }) => css`
    width: 720px;
    height: 620px;
    border-top-left-radius: ${theme.borderRadius.default};
    border-top-right-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
    overflow: auto;
    max-width: 100%;
    position: relative;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[7]};
  `}
`;

const SelectContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

const Select = styled.div`
  ${({ theme }) => css`
    display: flex;
    grid-template-columns: repeat(4, 1fr);
    border-bottom-left-radius: ${theme.borderRadius.default};
    gap: ${theme.spacing[7]};
  `}
`;

export default CustomizationPreview;
