import { IcoChevronRight16 } from '@onefootprint/icons';
import { Box, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import type { ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';
import styled, { css } from 'styled-components';
import Description from '../description';
import Enum from './components/enum';
import Header from './components/header';

export type SchemaData = {
  title: string;
  schema: ContentSchemaNoRef;
  isRequired?: boolean;
  isAnyOfOption?: boolean;
};

type SchemaProps = {
  schemaData: SchemaData;
  isInBrackets?: boolean;
  level?: number;
};

/** Renders an open API schema, including its header (name, type, description) and body. If schema is an object type, the body is collapsible. */
export const Schema = ({ schemaData, isInBrackets, level = 0 }: SchemaProps) => {
  const { title, schema } = schemaData;

  // The schema is collapsible if it's a complex type (object or anyOf) or an array of a complex type
  const isComplexType = (schema?: ContentSchemaNoRef) => !!schema?.properties || !!schema?.anyOf?.length;
  const isCollapsible = isComplexType(schema) || isComplexType(schema.items);

  // Minimize all objects past the first layer by default. And minimize the pagination
  const collapsedByDefault = level > 1 || title === 'meta';
  const [collapsed, setExpanded] = useState(isCollapsible && collapsedByDefault);
  const handleToggle = () => {
    setExpanded(current => !current);
  };

  return (
    <Stack direction="column">
      <HeaderCollapsibleButton disabled={!isCollapsible} onClick={handleToggle}>
        {isInBrackets && <Connector data-has-children={isCollapsible} />}
        {isCollapsible && (
          <IconBounds collapsed={collapsed}>
            <IcoChevronRight16 color="tertiary" />
          </IconBounds>
        )}
        <Header schemaData={schemaData} />
      </HeaderCollapsibleButton>
      <Box marginLeft={isInBrackets ? 7 : 0}>
        {schema.description && <Description>{schema.description}</Description>}
        {!collapsed && <SchemaBody schema={schema} isInBrackets={isInBrackets} level={level} />}
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
    return <SchemaBody schema={schema.items} isInBrackets={isInBrackets} level={level} />;
  }

  if (schema.enum) {
    return <Enum enums={schema.enum} />;
  }

  if (schema.properties) {
    const { properties, required = [] } = schema;
    return (
      <Stack direction="column" gap={2}>
        {Object.entries(properties).map(([title, property]) => (
          <BracketContainer isInBrackets={isInBrackets} key={title}>
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

  if (schema.anyOf) {
    const { anyOf } = schema;
    return anyOf.map(option => {
      // By convention, all of our anyOf options have a `kind` property that is an enum with a single value.
      // Only one has an `op` property.
      const kind = option.properties?.kind?.enum?.[0] || option.properties?.op?.enum?.[0];
      return (
        <BracketContainer isInBrackets={isInBrackets} key={kind}>
          <Schema
            schemaData={{ title: kind || '', schema: option, isAnyOfOption: true }}
            isInBrackets={isInBrackets}
            level={level + 1}
          />
        </BracketContainer>
      );
    });
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

const IconBounds = styled.div<{ collapsed: boolean }>`
  ${({ theme, collapsed }) => css`
    margin-right: ${theme.spacing[2]};
    transform: rotate(${collapsed ? '0deg' : '90deg'});
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

      &:first-child {
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

      &:not(:last-child) {
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
