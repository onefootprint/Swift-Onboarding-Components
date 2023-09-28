import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeBlock, media } from '@onefootprint/ui';
import React, { useMemo } from 'react';

import type {
  Content,
  ContentSchema,
} from '@/api-reference/api-reference.types';
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
        <Block title={t('request-example')} schema={requestSchema} />
      )}
      {responses
        ? Object.entries(responses).map(([code]) => {
            const schema = getSchemaFromComponent(responses[code]);
            return schema ? (
              <Block key={code} title={t('response-example')} schema={schema} />
            ) : null;
          })
        : null}
    </Container>
  );
};

type BlockProps = {
  title: string;
  schema: ContentSchema;
};

const Block = ({ title, schema }: BlockProps) => {
  const example = useMemo(() => getExample(schema), []);
  return (
    <CodeBlock language="json" title={title}>
      {JSON.stringify(example, null, 2)}
    </CodeBlock>
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
