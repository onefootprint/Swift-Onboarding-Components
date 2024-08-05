import { IcoChevronRight16 } from '@onefootprint/icons';
import { Box, CodeInline, Text, createFontStyles } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { ContentSchemaNoRef } from '@/api-reference/api-reference.types';

import Description from '../../../../../description';
import Enum from '../../../enum';

export type PropertyProps = {
  isRequired?: boolean;
  level?: number;
  schema: ContentSchemaNoRef;
  title: string;
  isArray?: boolean;
};

// One day we could have better logic  here
const plural = (v: string) => `${v}s`;

const ObjectProperties = ({ isRequired, title, schema, level = 0, isArray = false }: PropertyProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(currentExpanded => !currentExpanded);
  };

  const typeLabelParts = [];
  if (!isRequired) {
    typeLabelParts.push(t('optional'));
  }
  if (isArray) {
    typeLabelParts.push(t('array'));
    if (schema.type) {
      typeLabelParts.push(t('of'));
      typeLabelParts.push(plural(schema.type));
    }
    // Just leave the text as "array" if we can't find the type of the object in the array
  } else {
    typeLabelParts.push(schema.type);
  }
  const typeLabel = typeLabelParts.join(' ');

  const hasDescription = schema.description || schema.enum;

  if (schema.items) {
    return <ObjectProperties schema={schema.items} title={title} isRequired={isRequired} level={level} isArray />;
  }

  return (
    <Box>
      <TitleContainer>
        <Header>
          <Button disabled={!schema.properties} onClick={handleToggle}>
            <Connector aria-hidden data-has-children={!!schema.properties} data-level={level} />
            {schema.properties && (
              <IconBounds expanded={expanded}>
                <IcoChevronRight16 color="tertiary" />
              </IconBounds>
            )}
            <CodeInline disabled size="compact">
              {title}
            </CodeInline>
            <Separator>·</Separator>
            <Text variant="snippet-3" color="quaternary">
              {typeLabel}
            </Text>
          </Button>
        </Header>
        {hasDescription && (
          <Content data-level={level}>
            {schema.description && <Description>{schema.description}</Description>}
            {schema.enum && <Enum enums={schema.enum} />}
          </Content>
        )}
      </TitleContainer>
      {schema.properties && expanded && (
        <Child>
          {Object.entries(schema.properties).map(([childTitle, property]) => (
            <ObjectProperties
              key={childTitle}
              title={childTitle}
              schema={property}
              level={level + 1}
              isRequired={schema.required?.includes(childTitle)}
            />
          ))}
        </Child>
      )}
    </Box>
  );
};

const IconBounds = styled.div<{ expanded: boolean }>`
  ${({ theme, expanded }) => css`
    margin-right: ${theme.spacing[2]};
    transform: rotate(${expanded ? '90deg' : '0deg'});
    transition: transform 0.2s ease-in-out;
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    overflow: visible;
    padding-bottom: ${theme.spacing[4]};
  `}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
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

    &[data-level='1'] {
      width: ${theme.spacing[8]};
    }
  `}
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[9]};
    margin-top: ${theme.spacing[3]};
  `}
`;

const Child = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[4]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default ObjectProperties;
