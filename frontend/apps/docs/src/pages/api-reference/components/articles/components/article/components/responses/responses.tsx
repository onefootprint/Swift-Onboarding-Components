import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Badge, createFontStyles } from '@onefootprint/ui';
import _ from 'lodash';
import React from 'react';

import type {
  ResponseContentProps,
  ResponseProps,
} from '../../../../articles.types';
import Schema from './components/schema';

const Responses = ({ responses }: { responses: ResponseProps }) => {
  const { t } = useTranslation('pages.api-reference');

  return (
    <Container>
      <ResponsesTitle>{t('responses')}</ResponsesTitle>
      {Object.keys(responses).map(code => {
        const response = responses[
          code as keyof typeof responses
        ] as ResponseContentProps;
        const regex = /#\/components\/schemas\/(.+)/;
        const keys = response.content['application/json'].schema.$ref;
        const match = keys && keys.match(regex);
        const schema = match ? match[1] : null;

        return (
          <ResponseContainer key={_.uniqueId()}>
            <Badge variant={code === '200' ? 'success' : 'neutral'} key={code}>
              {code}
            </Badge>
            {schema && <Schema schema={schema} />}
          </ResponseContainer>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} 0;
    gap: ${theme.spacing[4]};
  `}
`;

const ResponsesTitle = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    display: flex;
    color: ${theme.color.primary};
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const ResponseContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    margin: ${theme.spacing[4]} 0 0 ${theme.spacing[3]};
  `}
`;

export default Responses;
