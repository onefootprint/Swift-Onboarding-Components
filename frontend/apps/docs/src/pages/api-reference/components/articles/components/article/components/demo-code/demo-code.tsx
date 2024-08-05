import { Box, CodeBlock, Text, media } from '@onefootprint/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Article, SecurityTypes } from '@/api-reference/api-reference.types';
import type { ContentSchema } from '@/api-reference/api-reference.types';
import { getExample, maybeEvaluateSchemaRef } from '@/api-reference/utils/get-schemas';
import { HydratedArticle } from 'src/pages/api-reference/hooks';

export type DemoCodeProps = {
  article: HydratedArticle;
};

const computeCurlRequest = (article: HydratedArticle) => {
  const requestSchema = article.requestBody;
  const referencedSchema = maybeEvaluateSchemaRef(requestSchema);
  const exampleRequest = useMemo(() => getExample(requestSchema), []); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = [];

  const security = article.security?.flatMap(s => Object.keys(s));
  security?.forEach(s => {
    const ExampleHeaderForSecurity: Record<SecurityTypes, string> = {
      'Secret API Key': '-u sk_test_xxxxx:',
      'Client Token': "-H 'X-Fp-Authorization: cttok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH'",
    };
    lines.push(ExampleHeaderForSecurity[s as SecurityTypes]);
  });

  if (article.security?.flatMap(s => Object.keys(s)).includes('')) {
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
  } else {
    // Add data fields to curl request
    httpMethodArgs = `-X ${article.method.toUpperCase()}`;
    if (referencedSchema?.type === 'object' || referencedSchema?.type === 'array') {
      const exampleRequestJson = JSON.stringify(exampleRequest, null, 2);
      lines.push(`-d '${exampleRequestJson}'`);
    } else if (article.requestBody) {
      lines.push(`-d '${exampleRequest}'`);
    }
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
      <Text tag="span" color="neutral" variant="caption-1" truncate maxWidth="100%">
        {path}
      </Text>
    </>
  );

  return (
    <Container>
      <CodeBlock language="bash" title={curlTitle} showLineNumbers>
        {computeCurlRequest(article)}
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
