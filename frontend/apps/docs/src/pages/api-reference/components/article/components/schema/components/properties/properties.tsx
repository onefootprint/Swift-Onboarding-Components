import styled, { css } from 'styled-components';

import type { ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';

import Enum from '../enum';
import ObjectProperties from './components/object-properties';

export type PropertiesProps = {
  schema: ContentSchemaNoRef;
};

// NOTE: The field name and description are rendered by the caller.
const Properties = ({ schema }: PropertiesProps) => {
  // Render array by rendering the array's elements
  if (schema.items) {
    return <Properties schema={schema.items} />;
  }

  // Render enum by rendering values
  if (schema.enum) {
    return <Enum enums={schema.enum} />;
  }

  // Render object by rendering each of its fields
  if (schema.properties) {
    return (
      <Container>
        {Object.entries(schema.properties).map(([title, property]) => (
          <ObjectProperties key={title} schema={property} title={title} isRequired={schema.required?.includes(title)} />
        ))}
      </Container>
    );
  }

  return null;
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding-left: ${theme.spacing[2]};
    margin-left: ${theme.spacing[4]};
    position: relative;
    border-left: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default Properties;
