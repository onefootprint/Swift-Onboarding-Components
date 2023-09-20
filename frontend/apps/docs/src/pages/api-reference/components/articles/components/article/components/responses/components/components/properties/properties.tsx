import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';

type PropertiesProps = {
  properties: Record<string, any>;
  title: string;
};

const Properties = ({ properties, title }: PropertiesProps) => (
  <Container>
    <Title>
      <Property>{title}</Property>
      {properties.type && (
        <>
          <Separator>·</Separator>
          <Type>{properties.type}</Type>
        </>
      )}
    </Title>
    {properties.description && (
      <Description>
        {properties.description.charAt(0).toUpperCase() +
          properties.description.slice(1)}
      </Description>
    )}
    {properties.enum && (
      <List>
        {properties.enum.map((enumValue: string) => (
          <Value key={enumValue}>{enumValue}</Value>
        ))}
      </List>
    )}
  </Container>
);

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

const Property = styled.h4`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
  `}
`;

const Type = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.secondary};
  `}
`;

const Value = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    color: ${theme.color.secondary};
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
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
