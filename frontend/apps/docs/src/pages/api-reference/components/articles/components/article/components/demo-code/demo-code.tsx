import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeBlock, media } from '@onefootprint/ui';
import React from 'react';

import type { Content } from '@/api-reference/api-reference.types';
import {
  getExample,
  getSchemaFromComponent,
} from '@/api-reference/utils/get-schemas';

export type DemoCodeProps = {
  responses: Record<string, Content>;
  requestBody?: Content;
};

const DemoCode = ({ requestBody, responses }: DemoCodeProps) => {
  const { t } = useTranslation('pages.api-reference');
  const requestSchema = getSchemaFromComponent(requestBody);
  return (
    <Container>
      {requestSchema && (
        <CodeBlock language={t('request-example')}>
          {JSON.stringify(getExample(requestSchema), null, 2)}
        </CodeBlock>
      )}
      {responses
        ? Object.entries(responses).map(([code]) => {
            const schema = getSchemaFromComponent(responses[code]);
            return schema ? (
              <CodeBlock key={code} language={t('response-example')}>
                {JSON.stringify(getExample(schema), null, 2)}
              </CodeBlock>
            ) : null;
          })
        : null}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    position: relative;
    margin-top: 0;
    height: 100%;
    max-width: 720px;

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[9]};
    `}
  `}
`;

export default DemoCode;
