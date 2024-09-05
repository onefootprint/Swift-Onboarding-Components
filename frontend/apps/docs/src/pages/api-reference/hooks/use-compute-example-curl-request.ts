import { useMemo } from 'react';

import { getExample } from '@/api-reference/utils/get-schemas';
import type { SecurityTypes } from 'src/pages/api-reference/api-reference.types';
import type { HydratedArticle } from 'src/pages/api-reference/hooks';
import useGetSandboxApiKey from './use-get-sandbox-api-key';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const useComputeExampleCurlRequest = (article: HydratedArticle) => {
  const requestSchema = article.requestBody?.content;
  const apiKey = useGetSandboxApiKey();

  // TODO look how stripe chooses which of your API keys to use. Should we just use the active admin key?
  return useMemo(() => {
    const exampleRequest = getExample(requestSchema);
    const lines = [];
    const security = article.security?.flatMap(s => Object.keys(s));
    security?.forEach(s => {
      const ExampleHeaderForSecurity: Record<SecurityTypes, string> = {
        'Secret API Key': `-u ${apiKey.data?.key || 'sk_test_xxxxx'}:`,
        'Dashboard Token': "-H 'X-Fp-Authorization: dbtok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH'",
        'User Token': "-H 'X-Fp-Authorization: utok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH'",
        'User Onboarding Token': "-H 'X-Fp-Authorization: utok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH'",
      };
      const example = ExampleHeaderForSecurity[s as SecurityTypes];
      if (example) {
        lines.push(ExampleHeaderForSecurity[s as SecurityTypes]);
      }
    });

    // Add required headers to curl request
    const headerParams = article.parameters?.filter(p => p.in === 'header').filter(p => p.required);
    headerParams?.forEach(p => lines.push(`-H '${p.name}: ${p.schema.example}'`));

    let httpMethodArgs = '';
    if (article.method === 'get') {
      // Add required querystring args to curl request
      const querystringParms = article.parameters
        ?.filter(p => p.in === 'query')
        .filter(p => p.required)
        .filter(p => !!p.schema.example);
      if (querystringParms?.length) {
        httpMethodArgs = '-G';
      }
      querystringParms?.forEach(p => lines.push(`-d ${p.name}=${p.schema.example}`));
    } else {
      // Add data fields to curl request
      httpMethodArgs = `-X ${article.method.toUpperCase()}`;
      if (requestSchema?.type === 'object' || requestSchema?.type === 'array' || typeof exampleRequest === 'object') {
        const exampleRequestJson = JSON.stringify(exampleRequest, null, 2);
        lines.push(`-d '${exampleRequestJson}'`);
      } else if (article.requestBody) {
        lines.push(`-d '${exampleRequest}'`);
      }
    }

    // Construct the first curl line
    const completePath = `${API_BASE_URL}${article.path}`;
    const curlLine = ['curl', httpMethodArgs, completePath].filter(l => l).join(' ');

    // Join all with escape character and newline. Indent every line except the first
    return [curlLine, ...lines].join(' \\\n').replaceAll('\n', '\n  ');
  }, [article, apiKey.data]);
};

export default useComputeExampleCurlRequest;
