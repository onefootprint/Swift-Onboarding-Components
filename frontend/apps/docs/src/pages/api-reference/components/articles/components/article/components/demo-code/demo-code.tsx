import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeBlock, media } from '@onefootprint/ui';
import React from 'react';

import type { Content } from '@/api-reference/api-reference.types';
import { getSchemaFromComponent } from '@/api-reference/utils/get-schemas';

export type DemoCodeProps = {
  responses: Record<string, Content>;
  requestBody?: Content;
};

const DemoCode = ({ requestBody, responses }: DemoCodeProps) => {
  const { t } = useTranslation('pages.api-reference');
  // this is the guy that we need to implement
  // we first get the schema, and from there, you'll understand
  const requestSchema = getSchemaFromComponent(requestBody);
  console.log(requestSchema);

  return responses ? (
    <Container>
      {Object.entries(responses).map(([code]) => {
        const schema = getSchemaFromComponent(responses[code]);
        return schema && schema.example ? (
          <CodeBlock key={code} language={t('response-example')}>
            {JSON.stringify(schema.example, null, 2)}
          </CodeBlock>
        ) : null;
      })}
    </Container>
  ) : null;
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
