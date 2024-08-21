import { Box, CodeBlock, Stack, Text } from '@onefootprint/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getExample } from '@/api-reference/utils/get-schemas';
import type { ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';
import type { HydratedArticle } from 'src/pages/api-reference/hooks';
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
    <Stack direction="column" gap={5}>
      <CodeBlock language="bash" title={curlTitle} showLineNumbers>
        {exampleCurlRequest}
      </CodeBlock>
      {responses &&
        Object.entries(responses).map(([code, schema]) => {
          return <Block key={code} title={t('response-example')} schema={schema} />;
        })}
    </Stack>
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

export default DemoCode;
