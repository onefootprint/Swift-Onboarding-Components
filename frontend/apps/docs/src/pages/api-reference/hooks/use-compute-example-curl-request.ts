import { useMemo } from 'react';

import type { SecurityTypes } from '@/api-reference/api-reference.types';
import { getExample } from '@/api-reference/utils/get-schemas';
import { HydratedArticle } from 'src/pages/api-reference/hooks';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const useComputeExampleCurlRequest = (article: HydratedArticle) => {
  const requestSchema = article.requestBody;

  // TODO look how stripe chooses which of your API keys to use. Should we just use the active admin key?
  return useMemo(() => {
    const exampleRequest = getExample(requestSchema);

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
      if (requestSchema?.type === 'object' || requestSchema?.type === 'array') {
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
  }, [requestSchema]);
};

export default useComputeExampleCurlRequest;
