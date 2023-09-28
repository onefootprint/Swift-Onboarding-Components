import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { evaluateSchemaRef } from 'src/pages/api-reference/utils/get-schemas';

import type { ContentSchema } from '@/api-reference/api-reference.types';

import Description from '../description';
import Enum from './components/enum';
import Header from './components/header';
import Properties from './components/properties/properties';

type SchemaProps = {
  schema: ContentSchema;
};

const Schema = ({ schema }: SchemaProps) => {
  // We should make this a fully recursive component, similar to getExample
  let schemaToRender: ContentSchema | undefined = schema;
  if (schema.type === 'array') {
    // TODO we need to provide another distinction in the UI that the body is an array and not an
    // object
    schemaToRender = schema.items;
  }
  const ref = schemaToRender?.$ref;
  if (ref) {
    schemaToRender = evaluateSchemaRef(ref);
  }
  if (!schemaToRender) {
    return null;
  }
  const { properties, required = [] } = schemaToRender;

  return properties ? (
    <Container>
      {schemaToRender.description && (
        <Description>{schemaToRender.description}</Description>
      )}
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
