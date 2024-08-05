import { Badge, Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { ContentSchema } from '@/api-reference/api-reference.types';

import Schema from '../schema';

export type ResponsesProps = {
  responses: Record<string, ContentSchema>;
};

const Responses = ({ responses }: ResponsesProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  if (Object.keys(responses).length === 0) {
    return null;
  }
  if (Object.keys(responses).length > 1) {
    // We have an assertion in update_open_api.py that we only have one response per API
    console.error('Multiple responses for API');
  }
  const [code, schema] = Object.entries(responses)[0];

  return (
    <Container>
      <ResponsesTitle>{t('response')}</ResponsesTitle>
      <ResponseContainer key={code}>{schema && <Schema schema={schema} isInBrackets />}</ResponseContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[4]};
    gap: ${theme.spacing[5]};
  `}
`;

const ResponsesTitle = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-1')}
    display: flex;
    color: ${theme.color.primary};
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const ResponseContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    margin: ${theme.spacing[4]} 0 0 ${theme.spacing[3]};
  `}
`;

export default Responses;
