import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Badge, createFontStyles } from '@onefootprint/ui';
import React from 'react';

import type { Content } from '@/api-reference/api-reference.types';
import { getSchemaFromComponent } from '@/api-reference/utils/get-schemas';

import Schema from '../schema';

export type ResponsesProps = {
  responses: Record<string, Content>;
};

const Responses = ({ responses }: ResponsesProps) => {
  const { t } = useTranslation('pages.api-reference');

  return Object.keys(responses).length === 0 ? null : (
    <Container>
      <ResponsesTitle>{t('responses')}</ResponsesTitle>
      {Object.entries(responses).map(([code, response]) => {
        const schema = getSchemaFromComponent(response as Content);
        return (
          <ResponseContainer key={code}>
            <Badge variant={code === '200' ? 'success' : 'neutral'}>
              {code}
            </Badge>
            {schema && <Schema schema={schema} isInBrackets />}
          </ResponseContainer>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} 0;
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
