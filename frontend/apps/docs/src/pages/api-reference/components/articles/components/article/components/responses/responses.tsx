import { Badge, Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Content } from '@/api-reference/api-reference.types';
import { getSchemaFromComponent } from '@/api-reference/utils/get-schemas';

import Schema from '../schema';

export type ResponsesProps = {
  responses: Record<string, Content>;
};

const Responses = ({ responses }: ResponsesProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });

  return Object.keys(responses).length === 0 ? null : (
    <Container>
      <ResponsesTitle>{t('responses')}</ResponsesTitle>
      {Object.entries(responses).map(([code, response]) => {
        const schema = getSchemaFromComponent(response as Content);
        return (
          <ResponseContainer key={code}>
            <Header>
              <Badge variant={code === '200' ? 'success' : 'neutral'}>{code}</Badge>
              {schema?.type && (
                <>
                  <Separator>·</Separator>
                  <Text variant="snippet-3" color="quaternary">
                    {schema?.type}
                  </Text>
                </>
              )}
            </Header>
            {schema && <Schema schema={schema} isInBrackets />}
          </ResponseContainer>
        );
      })}
    </Container>
  );
};

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

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

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
  `};
`;

export default Responses;
