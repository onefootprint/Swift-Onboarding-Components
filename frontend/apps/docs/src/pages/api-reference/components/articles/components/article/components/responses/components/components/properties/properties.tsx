import { CodeInline, Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type PropertiesProps = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  properties: Record<string, any>;
  title: string;
};

const Properties = ({ properties, title }: PropertiesProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  return (
    <Container>
      <Title>
        <CodeInline disabled>{title}</CodeInline>
        {properties.type && (
          <>
            <Separator>·</Separator>
            <Type>{properties.type}</Type>
          </>
        )}
      </Title>
      {properties.description && (
        <Description>{properties.description.charAt(0).toUpperCase() + properties.description.slice(1)}</Description>
      )}
      {properties.enum && (
        <AllowedValues>
          <Text variant="body-4" color="tertiary">
            {t('allowed-values')}
          </Text>
          <List>
            {properties.enum.map((enumValue: string) => (
              <CodeInline size="compact" key={enumValue} disabled>
                {enumValue}
              </CodeInline>
            ))}
          </List>
        </AllowedValues>
      )}
    </Container>
  );
};

const AllowedValues = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

const Type = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.secondary};
  `}
`;

const List = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.primary};
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

const Description = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
  `}
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

export default Properties;
