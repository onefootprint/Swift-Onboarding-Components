import { CodeInline, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';
import styled, { css } from 'styled-components';
import type { SchemaData } from '../schema';

// One day we could have better logic  here
const plural = (v: string) => `${v}s`;

type HeaderProps = {
  schemaData: SchemaData;
};

const useGetSchemaType = (schemaData: SchemaData) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const { schema, isRequired, isAnyOfOption } = schemaData;

  const getPrimitiveType = (schema: ContentSchemaNoRef) => {
    if (schema.anyOf) {
      // This is a little clunky of a display, but we only use anyOf on our internal APIs
      return t('anyOf');
    }
    if (isAnyOfOption) {
      return t('option');
    }
    return schema.type;
  };

  const typeLabelParts = [];
  if (!isRequired && !isAnyOfOption) {
    typeLabelParts.push(t('optional'));
  }
  if (schema.items !== undefined) {
    typeLabelParts.push(t('array'));
    const itemType = getPrimitiveType(schema.items);
    if (itemType) {
      typeLabelParts.push(t('of'));
      typeLabelParts.push(plural(itemType));
    }
    // Just leave the text as "array" if we can't find the type of the object in the array
  } else {
    typeLabelParts.push(getPrimitiveType(schema));
  }
  return typeLabelParts.join(' ');
};

/** Renders the title and type of a schema */
const Header = ({ schemaData }: HeaderProps) => {
  const { title } = schemaData;
  const typeLabel = useGetSchemaType(schemaData);

  return (
    <StyledStack align="center" justify="flex-start" gap={3}>
      <Column>
        <CodeInline disabled>{title}</CodeInline>
        <Separator>·</Separator>
        <Text variant="snippet-2" color="quaternary">
          {typeLabel}
        </Text>
      </Column>
    </StyledStack>
  );
};

const StyledStack = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2', 'code')}
    padding: ${theme.spacing[3]} 0;
    background: ${theme.backgroundColor.primary};
  `}
`;

const Column = styled.div`
  ${({ theme }) => css`
    align-items: center;
    color: ${theme.color.secondary};
    display: flex;
    gap: ${theme.spacing[2]};
    position: relative;
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

export default Header;
