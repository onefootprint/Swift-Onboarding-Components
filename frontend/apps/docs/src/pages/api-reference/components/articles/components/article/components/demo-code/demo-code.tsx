import { Box, CodeBlock, Text, media } from '@onefootprint/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { ContentSchemaNoRef } from '@/api-reference/api-reference.types';
import { getExample } from '@/api-reference/utils/get-schemas';
import { HydratedArticle } from 'src/pages/api-reference/hooks';
import useComputeExampleCurlRequest from 'src/pages/api-reference/hooks/use-compute-example-curl-request';

export type DemoCodeProps = {
  article: HydratedArticle;
};

const getColorFromMethod = (method: string) => {
  if (method === 'get') return 'neutral';
  if (method === 'post') return 'success';
  if (method === 'patch') return 'warning';
  if (method === 'delete') return 'error';
  return 'primary';
};

const DemoCode = ({ article }: DemoCodeProps) => {
  const { responses } = article;
  const method = article.method;
  const path = article.path;
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const exampleCurlRequest = useComputeExampleCurlRequest(article);

  const curlTitle = (
    <>
      <Box tag="span" color={getColorFromMethod(method)}>
        {method.toUpperCase()}
      </Box>
      <Text tag="span" color="neutral" variant="caption-1" truncate maxWidth="100%">
        {path}
      </Text>
    </>
  );

  return (
    <Container>
      <CodeBlock language="bash" title={curlTitle} showLineNumbers>
        {exampleCurlRequest}
      </CodeBlock>
      {responses &&
        Object.entries(responses).map(([code, schema]) => {
          return <Block key={code} title={t('response-example')} schema={schema} />;
        })}
    </Container>
  );
};

type BlockProps = {
  title: string;
  schema: ContentSchemaNoRef;
};

const Block = ({ title, schema }: BlockProps) => {
  const example = useMemo(() => getExample(schema), []); // eslint-disable-line react-hooks/exhaustive-deps
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
    padding-top: ${theme.spacing[8]};
    padding-bottom: ${theme.spacing[8]};
    width: 100%;
    max-width: 720px;

    ${media.greaterThan('md')`
      position: sticky;
      top: 0;
      z-index: 1;
    `}
  `}
`;

export default DemoCode;
