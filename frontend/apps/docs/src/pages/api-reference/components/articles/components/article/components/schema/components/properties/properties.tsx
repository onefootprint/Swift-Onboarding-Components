import styled, { css } from '@onefootprint/styled';
import React from 'react';

import type { SchemaPropertyItem } from '@/api-reference/api-reference.types';

import Property from './components/property';

export type PropertiesProps = {
  properties: Record<string, SchemaPropertyItem>;
};

const Properties = ({ properties }: PropertiesProps) => (
  <Container>
    {Object.entries(properties).map(([title, property]) => (
      <Property key={title} property={property} title={title} />
    ))}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    border-left: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding-left: ${theme.spacing[2]};
    margin-left: ${theme.spacing[4]};
    position: relative;
  `}
`;

export default Properties;
