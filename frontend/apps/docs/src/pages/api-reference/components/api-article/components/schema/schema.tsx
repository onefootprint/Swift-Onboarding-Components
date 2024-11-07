import { IcoChevronRight16 } from '@onefootprint/icons';
import { Box, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import type { ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';
import styled, { css } from 'styled-components';
import Description from '../description';
import Enum from './components/enum';
import Header from './components/header';

type SchemaProps = {
  schemaData: {
    title: string;
    schema: ContentSchemaNoRef;
    isRequired?: boolean;
  };
  isInBrackets?: boolean;
  level?: number;
};

/** Renders an open API schema, including its header (name, type, description) and body. If schema is an object type, the body is collapsible. */
export const Schema = ({ schemaData, isInBrackets, level = 0 }: SchemaProps) => {
  const { title, schema, isRequired } = schemaData;
  // If the schema is not an object, it's always expanded
  const isObjectSchema = !!schema.properties || !!schema.items?.properties;
  // Minimize all objects past the first layer by default. And minimize the pagination
  const minimizeByDefault = level > 1 || title === 'meta';
  const [expanded, setExpanded] = useState(!isObjectSchema || !minimizeByDefault);
  const handleToggle = () => {
    setExpanded(currentExpanded => !currentExpanded);
  };

  return (
    <Stack direction="column">
      <HeaderCollapsibleButton disabled={!isObjectSchema} onClick={handleToggle}>
        {isInBrackets && <Connector data-has-children={isObjectSchema} />}
        {isObjectSchema && (
          <IconBounds expanded={expanded}>
            <IcoChevronRight16 color="tertiary" />
          </IconBounds>
        )}
        <Header title={title} schema={schema} isRequired={isRequired} isInBrackets={isInBrackets} />
      </HeaderCollapsibleButton>
      <Box marginLeft={isInBrackets ? 7 : 0}>
        {schema.description && <Description>{schema.description}</Description>}
        {expanded && <SchemaBody schema={schema} isInBrackets={isInBrackets} level={level} />}
      </Box>
    </Stack>
  );
};

type SchemaBodyProps = {
  schema: ContentSchemaNoRef;
  isInBrackets?: boolean;
  level?: number;
};

/** Renders details about an open API schema, not including its header (name, type, and description). */
export const SchemaBody = ({ schema, isInBrackets = false, level = 0 }: SchemaBodyProps) => {
  // Render array by rendering the array's elements
  if (schema.type === 'array' && schema.items) {
    return <SchemaBody schema={schema.items} isInBrackets={isInBrackets} />;
  }

  if (schema.enum) {
    return <Enum enums={schema.enum} />;
  }

  if (schema.properties) {
    const { properties, required = [] } = schema;
    return (
      <Stack direction="column" gap={2}>
        {Object.entries(properties).map(([title, property]) => (
          <BracketContainer
            isInBrackets={isInBrackets}
            key={title}
            data-last-child={Object.keys(properties).indexOf(title) === Object.keys(properties).length - 1}
            data-first-child={Object.keys(properties).indexOf(title) === 0}
          >
            <Schema
              schemaData={{ title, schema: property, isRequired: required?.includes(title) }}
              isInBrackets={isInBrackets}
              level={level + 1}
            />
          </BracketContainer>
        ))}
      </Stack>
    );
  }

  return null;
};

const Connector = styled.div`
  ${({ theme }) => css`
    background: ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]};
    margin-left: calc(${theme.spacing[2]} * -1);
    width: ${theme.spacing[3]};

    &[data-has-children='false'] {
      width: ${theme.spacing[5]};
      margin-right: ${theme.spacing[3]};
    }
  `}
`;

const IconBounds = styled.div<{ expanded: boolean }>`
  ${({ theme, expanded }) => css`
    margin-right: ${theme.spacing[2]};
    transform: rotate(${expanded ? '90deg' : '0deg'});
    transition: transform 0.2s ease-in-out;
  `}
`;

const HeaderCollapsibleButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;

  &:disabled {
    cursor: initial;
  }
`;

const BracketContainer = styled.div<{ isInBrackets?: boolean }>`
  ${({ theme, isInBrackets }) => css`
    display: flex;
    flex-direction: column;
    position: relative;

    ${
      isInBrackets &&
      css`
      padding-left: ${theme.spacing[2]};

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
          height: calc(100% + ${theme.spacing[1]});
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
