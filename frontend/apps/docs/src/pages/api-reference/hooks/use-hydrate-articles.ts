import { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import useSession from 'src/hooks/use-session';
import {
  type ApiArticle,
  type ContentSchema,
  type ContentSchemaNoRef,
  SecurityTypes,
} from '../../api-reference/api-reference.types';
import { evaluateSchemaRef } from '../utils/get-schemas';

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

// TODO unit tests
const getPreviewApiGateFromDescription = (description: string) => {
  const gatedRegex = /gated\(([A-Za-z_-]+)\)/;
  return gatedRegex.exec(description)?.[1] as TenantPreviewApi | undefined;
};

const useHydrateArticles = (articles: ApiArticle[]): HydratedApiArticle[] => {
  const {
    data: { user },
  } = useSession();

  const canAccessPreviewApi = (previewApi: TenantPreviewApi) =>
    user?.tenant?.allowedPreviewApis?.includes(previewApi) || user?.isFirmEmployee || false;

  /** Filters out feature-gated properties from the provided properties */
  const filterVisibleProperties = (properties?: Record<string, ContentSchemaNoRef>) => {
    if (!properties) return undefined;
    return Object.fromEntries(
      Object.entries(properties).flatMap(([name, schema]) => {
        const requiredPreviewApi = getPreviewApiGateFromDescription(schema.description || '');
        if (requiredPreviewApi && !canAccessPreviewApi(requiredPreviewApi)) {
          return [];
        }
        return [[name, schema]];
      }),
    );
  };

  const hydrateSchema = (schema: ContentSchema) => {
    const dereferencedSchema = dereferenceSchema(schema);
    return {
      ...dereferencedSchema,
      properties: filterVisibleProperties(dereferencedSchema.properties),
    };
  };

  // TODO move getSchema here, make it a function of the provided open API spec?

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
    let canAccessApi = !requiredPreviewGate || canAccessPreviewApi(requiredPreviewGate);

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

    const requestBodyRef = article.requestBody?.content['application/json'].schema;
    const requestBody = requestBodyRef
      ? {
          ...hydrateSchema(requestBodyRef),
          isRequired: article.requestBody?.required || false,
        }
      : undefined;
    const responses = Object.fromEntries(
      Object.entries(article.responses || {}).map(([code, content]) => {
        const schemaRef = content.content['application/json'].schema;
        return [code, hydrateSchema(schemaRef)];
      }),
    );

    return {
      ...article,
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

/** Open API request and response schemas may by defined either inline or by a reference to a list of schemas. This dereferenecs the referenced schema and returns a guaranteed schema definition. */
const dereferenceSchema = (schema: ContentSchema): ContentSchemaNoRef => {
  if (schema.$ref) {
    const dereferencedSchema = evaluateSchemaRef(schema.$ref);
    if (!dereferencedSchema) {
      throw Error(`Couldn't dereference schema ${schema.$ref}`);
    }
    return dereferencedSchema;
  }
  if (schema.items?.$ref) {
    return {
      ...schema,
      items: dereferenceSchema(schema.items),
    };
  }
  return schema;
};
