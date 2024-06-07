import { Box, Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Content } from '@/api-reference/api-reference.types';
import { getSchemaFromComponent } from '@/api-reference/utils/get-schemas';

import Schema from '../schema';

type RequestBodyProps = {
  requestBody: Content;
};

const RequestBody = ({ requestBody }: RequestBodyProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const schema = getSchemaFromComponent(requestBody);
  const isOptional = !requestBody?.required;

  return schema ? (
    <Box>
      <Header>
        <Title>{t('request-body')}</Title>
        {isOptional && (
          <>
            <Separator>·</Separator>
            <Text variant="snippet-3" color="quaternary">
              {t('optional')}
            </Text>
          </>
        )}
      </Header>
      <Schema schema={schema} isInBrackets />
    </Box>
  ) : null;
};

const Title = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[2]};
  `};
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

export default RequestBody;
