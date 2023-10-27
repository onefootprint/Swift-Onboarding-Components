import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CodeInline,
  createFontStyles,
  Stack,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import type { ContentSchema } from 'src/pages/api-reference/api-reference.types';

type HeaderProps = {
  title: string;
  schema: ContentSchema;
  isRequired?: boolean;
  isInBrackets?: boolean;
};

// One day we could have better logic  here
const plural = (v: string) => `${v}s`;

const Header = ({ title, schema, isRequired, isInBrackets }: HeaderProps) => {
  const { t } = useTranslation('pages.api-reference');

  const typeLabelParts = [];
  if (!isRequired) {
    typeLabelParts.push(t('optional'));
  }
  if (schema.items !== undefined) {
    typeLabelParts.push(t('array'));
    typeLabelParts.push(plural(schema.items?.type));
  } else {
    typeLabelParts.push(schema.type);
  }
  const typeLabel = typeLabelParts.join(' ');

  return (
    <StyledStack align="center" justify="flex-start" gap={3}>
      <Column isInBrackets={isInBrackets}>
        <CodeInline disabled>{title}</CodeInline>
        <Separator>·</Separator>
        <Typography variant="snippet-3" color="quaternary">
          {typeLabel}
        </Typography>
      </Column>
    </StyledStack>
  );
};

const StyledStack = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    padding: ${theme.spacing[3]} 0;
    top: 0;
    z-index: 1;
    position: sticky;
    background: ${theme.backgroundColor.primary};
    top: 0;
  `}
`;

const Column = styled.div<{ isInBrackets?: boolean }>`
  ${({ theme, isInBrackets }) => css`
    align-items: center;
    color: ${theme.color.secondary};
    display: flex;
    gap: ${theme.spacing[2]};
    position: relative;

    ${isInBrackets &&
    css`
      &:before {
        content: '';
        background: ${theme.borderColor.tertiary};
        height: ${theme.borderWidth[1]};
        width: ${theme.spacing[4]};
        left: calc(-1 * ${theme.spacing[4]});
        position: absolute;
        transform: translateY(-50%);
        top: 50%;
      }
    `}
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
