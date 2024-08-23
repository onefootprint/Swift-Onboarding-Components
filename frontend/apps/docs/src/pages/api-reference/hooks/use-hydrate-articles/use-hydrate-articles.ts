import { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import {
  type ApiArticle,
  type ContentSchemaNoRef,
  type RequestOrResponse,
  SecurityTypes,
} from '../../api-reference.types';
import useCanAccessPreviewApi from './hooks/use-can-access-preview-api';
import useHydrateSchema from './hooks/use-hydrate-schema';
import getArticles from './utils/get-articles';

type AdditionalArticleProps = {
  /** True if this API should be hidden when the tenant doesn't have access to it. */
  hideWhenLocked: boolean;
  /** True if the API is should be hidden from the docs site. */
  isHidden: boolean;
  /** True if the authenticated tenant has access to hit this API (with regards to preview gates). */
  canAccessApi: boolean;
  /** Though an API may have multiple tags associated with it, this is the singular "identifying" tag that
   * controls some high-level visibility rules.
   */
  tag?: ArticleTag;
};

export enum ArticleTag {
  preview = 'Preview',
  phasedOut = 'PhasedOut',
  publicApi = 'PublicApi',
}

export type HydratedApiArticle = ApiArticle<ContentSchemaNoRef> & AdditionalArticleProps;

// TODO this should take in an open API spec
const useHydrateArticles = (rawArticles: Record<string, unknown>): HydratedApiArticle[] => {
  const hydrateSchema = useHydrateSchema(rawArticles);
  const canAccessPreviewApi = useCanAccessPreviewApi();

  const articles = getArticles(rawArticles);

  return articles.map(article => {
    const hasTag = (tag: string) => article.tags?.includes(tag) || false;

    const requiredPreviewGates = (article.security || [])
      .flatMap(s => s[SecurityTypes.apiKey] || [])
      .filter(s => s.startsWith('preview:'))
      .map(s => s.replace('preview:', '') as TenantPreviewApi);
    if (requiredPreviewGates.length > 1) {
      console.error(
        `API with multiple required preview gates: ${article.method} ${article.path}, ${requiredPreviewGates}`,
      );
    }

    const tag = Object.values(ArticleTag).filter(t => hasTag(t))[0];
    const requiredPreviewGate: TenantPreviewApi | undefined = requiredPreviewGates[0];
    let canAccessApi = canAccessPreviewApi(requiredPreviewGate);

    const hydrateRequestOrResponse = (r: RequestOrResponse): RequestOrResponse<ContentSchemaNoRef> => {
      const { content, headers: rawHeaders, ...restOfR } = r;
      const schemaRef = content['application/json'].schema;
      const headers = Object.fromEntries(
        Object.entries(rawHeaders || {}).filter(([_, header]) => canAccessPreviewApi(header.x_fp_preview_gate)),
      );
      return {
        content: hydrateSchema(schemaRef),
        headers,
        ...restOfR,
      };
    };

    if (hasTag('ClientVaulting')) {
      // Client-vaulting APIs have some custom visibility logic.
      // We don't actually impose a preview API guard on the client vaulting APIs aside from generating the
      // client_token. But we want to hide all client vaulting APIs if the tenant doesn't have access to
      // generate the client_token
      canAccessApi = canAccessPreviewApi(TenantPreviewApi.ClientVaultingDocs);
    }

    // Employees should always be able to see every API
    const hideWhenLocked = hasTag('HideWhenLocked');
    const isHidden = hideWhenLocked && !canAccessApi;

    const requestBody = article.requestBody ? hydrateRequestOrResponse(article.requestBody) : undefined;

    const responses = Object.fromEntries(
      Object.entries(article.responses || {}).map(([code, response]) => {
        return [code, hydrateRequestOrResponse(response)];
      }),
    );
    const parameters = (article.parameters || [])?.filter(parameter =>
      canAccessPreviewApi(parameter.schema.x_fp_preview_gate),
    );

    return {
      ...article,
      parameters,
      hideWhenLocked,
      isHidden,
      canAccessApi,
      tag,
      requestBody,
      responses,
    };
  });
};

export default useHydrateArticles;
