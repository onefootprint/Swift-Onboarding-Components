import { Box, CodeBlock, media } from '@onefootprint/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Article } from '@/api-reference/api-reference.types';
import type { ContentSchema } from '@/api-reference/api-reference.types';
import { getExample, getSchemaFromComponent, maybeEvaluateSchemaRef } from '@/api-reference/utils/get-schemas';

export type DemoCodeProps = {
  article: Article;
};

const computeCurlRequest = (article: Article) => {
  const requestSchema = getSchemaFromComponent(article.requestBody);
  const referencedSchema = maybeEvaluateSchemaRef(requestSchema);
  const exampleRequest = useMemo(() => getExample(requestSchema), []); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = [];

  if (article.security?.flatMap(s => Object.keys(s)).includes('Secret API Key')) {
    lines.push(`-u sk_test_xxxxx:`);
  }

  // Add required headers to curl request
  const headerParams = article.parameters?.filter(p => p.in === 'header').filter(p => p.required);
  headerParams?.forEach(p => lines.push(`-H '${p.name}: ${p.example}'`));

  let httpMethodArgs = '';
  if (article.method === 'get') {
    // Add required querystring args to curl request
    const querystringParms = article.parameters
      ?.filter(p => p.in === 'query')
      .filter(p => p.required)
      .filter(p => !!p.example);
    if (querystringParms?.length) {
      httpMethodArgs = '-G';
    }
    querystringParms?.forEach(p => lines.push(`-d ${p.name}=${p.example}`));
  } else if (article.requestBody) {
    // Add data fields to curl request
    httpMethodArgs = `-X ${article.method.toUpperCase()}`;
    if (referencedSchema?.type === 'object' || referencedSchema?.type === 'array') {
      const exampleRequestJson = JSON.stringify(exampleRequest, null, 2);
      lines.push(`-d '${exampleRequestJson}'`);
    } else {
      lines.push(`-d '${exampleRequest}'`);
    }
  }

  if (article.path === '/users/{fp_id}/vault/{identifier}/upload') {
    console.log(article);
  }

  // Construct the first curl line
  const completePath = `https://api.onefootprint.com${article.path}`;
  const curlLine = ['curl', httpMethodArgs, completePath].filter(l => l).join(' ');

  // Join all with escape character and newline. Indent every line except the first
  return [curlLine, ...lines].join(' \\\n').replaceAll('\n', '\n  ');
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

  const curlTitle = (
    <>
      <Box tag="span" color={getColorFromMethod(method)}>
        {method.toUpperCase()}
      </Box>
      {path}
    </>
  );

  return (
    <Container>
      <CodeBlock language="bash" title={curlTitle} showLineNumbers>
        {computeCurlRequest(article)}
      </CodeBlock>
      {responses &&
        Object.entries(responses).map(([code]) => {
          const schema = getSchemaFromComponent(responses[code]);
          return schema ? <Block key={code} title={t('response-example')} schema={schema} /> : null;
        })}
    </Container>
  );
};

type BlockProps = {
  title: string;
  schema: ContentSchema;
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
    position: relative;
    margin-top: 0;
    height: 100%;
    width: 100%;
    max-width: 720px;

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[9]};
    `}
  `}
`;

export default DemoCode;
