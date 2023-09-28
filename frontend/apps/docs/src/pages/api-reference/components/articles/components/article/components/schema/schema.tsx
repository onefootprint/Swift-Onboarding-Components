import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';

import type { ComponentSchema } from '@/api-reference/api-reference.types';

import Description from '../description';
import Enum from './components/enum';
import Header from './components/header';
import Properties from './components/properties/properties';

type SchemaProps = {
  schema: ComponentSchema;
};

const Schema = ({ schema }: SchemaProps) => {
  const { properties, required = [] } = schema;

  return properties ? (
    <Container>
      {schema.description && <Description>{schema.description}</Description>}
      {Object.entries(properties).map(([title, property]) => (
        <LinedContainer
          key={title}
          data-last-child={
            Object.keys(properties).indexOf(title) ===
            Object.keys(properties).length - 1
          }
        >
          <Header
            title={title}
            type={property.type}
            isRequired={required.length > 0 && required.includes(title)}
          />
          <Grid>
            {property.description ? (
              <Description>{property.description}</Description>
            ) : null}
            {property.enum ? <Enum enums={property.enum} /> : null}
            {property.properties && (
              <Properties properties={property.properties} />
            )}
            {property.items ? (
              <Box>
                {property.items.enum && <Enum enums={property.items.enum} />}
                {property.items.properties && (
                  <Properties properties={property.items.properties} />
                )}
              </Box>
            ) : null}
          </Grid>
        </LinedContainer>
      ))}
    </Container>
  ) : null;
};

const LinedContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding-left: ${theme.spacing[4]};
    position: relative;

    &[data-last-child='false'] {
      &:before {
        content: '';
        background: ${theme.borderColor.tertiary};
        height: calc(100% + ${theme.spacing[2]});
        width: ${theme.borderWidth[1]};
        left: 0;
        position: absolute;
        top: 20px;
      }
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-left: ${theme.spacing[4]};
    position: relative;
  `}
`;

const Grid = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

export default Schema;
