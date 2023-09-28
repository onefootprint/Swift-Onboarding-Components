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
  isInBrackets?: boolean;
};

const Schema = ({ schema, isInBrackets = false }: SchemaProps) => {
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
        <BracketContainer
          isInBrackets={isInBrackets}
          key={title}
          data-last-child={
            Object.keys(properties).indexOf(title) ===
            Object.keys(properties).length - 1
          }
          data-first-child={Object.keys(properties).indexOf(title) === 0}
        >
          <Header
            title={title}
            type={property.type}
            isRequired={required.length > 0 && required.includes(title)}
            isInBrackets={isInBrackets}
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
        </BracketContainer>
      ))}
    </Container>
  ) : null;
};

const BracketContainer = styled.div<{ isInBrackets?: boolean }>`
  ${({ theme, isInBrackets }) => css`
    display: flex;
    flex-direction: column;
    position: relative;

    ${isInBrackets &&
    css`
      padding-left: ${theme.spacing[4]};

      &[data-first-child='true'] {
        &:after {
          content: '';
          background: ${theme.borderColor.tertiary};
          height: ${theme.spacing[6]};
          width: ${theme.borderWidth[1]};
          left: 0;
          top: 0;
          position: absolute;
        }
      }

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
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
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
