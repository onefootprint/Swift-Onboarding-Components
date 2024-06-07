import React from 'react';
import { evaluateSchemaRef } from 'src/pages/api-reference/utils/get-schemas';
import styled, { css } from 'styled-components';

import type { ContentSchema } from '@/api-reference/api-reference.types';

import Description from '../description';
import Header from './components/header';
import Properties from './components/properties/properties';

type SchemaProps = {
  schema: ContentSchema;
  isInBrackets?: boolean;
};

/// Renders a schema's properties, whether the schema is an object or an array.
/// Intended to be used as the top-level component to render a schema so each property in the schema.
/// The top-level schema doesn't have a name
const Schema = ({ schema, isInBrackets = false }: SchemaProps) => {
  // Render referenced schema
  if (schema.$ref) {
    const referencedSchema = evaluateSchemaRef(schema.$ref);
    if (referencedSchema) {
      return <Schema schema={referencedSchema} isInBrackets={isInBrackets} />;
    }
    console.warn("Couldn't find referenced schema!", schema.$ref);
  }
  // Render array by rendering the array's elements
  if (schema.type === 'array' && schema.items) {
    return <Schema schema={schema.items} isInBrackets={isInBrackets} />;
  }

  // Render object by rendering each of its fields
  const { properties, required = [] } = schema;
  if (properties) {
    return (
      <Container>
        {schema.description && <Description>{schema.description}</Description>}
        {Object.entries(properties).map(([title, property]) => (
          <BracketContainer
            isInBrackets={isInBrackets}
            key={title}
            data-last-child={Object.keys(properties).indexOf(title) === Object.keys(properties).length - 1}
            data-first-child={Object.keys(properties).indexOf(title) === 0}
          >
            <Grid>
              <Header
                title={title}
                schema={property}
                isRequired={required.length > 0 && required.includes(title)}
                isInBrackets={isInBrackets}
              />
              {property.description && <Description>{property.description}</Description>}
              <Properties schema={property} />
            </Grid>
          </BracketContainer>
        ))}
      </Container>
    );
  }

  // We don't yet have any other top-level schema types (like an HTTP response that's just an enum)
  if (schema.type !== 'object') {
    console.warn('Cannot render schema', schema);
  }
  return null;
};

const BracketContainer = styled.div<{ isInBrackets?: boolean }>`
  ${({ theme, isInBrackets }) => css`
    display: flex;
    flex-direction: column;
    position: relative;

    ${
      isInBrackets &&
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
    `
    }
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
