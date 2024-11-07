import type { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';

type Content = {
  'application/json': {
    // TODO these always have a "$ref", not a normal ContentSchema
    schema: ContentSchema;
  };
};

export type RequestOrResponse<TContent = Content> = {
  description?: string;
  headers?: Record<string, ResponseHeader>;
  content: TContent;
  required?: boolean;
};

export type ResponseHeader = FpExtensions & {
  description: string;
  style: 'simple';
  content: {};
};

export enum SecurityTypes {
  apiKey = 'Secret API Key',
  dashboard = 'Dashboard Token',
  user = 'User Token',
  userOnboarding = 'User Onboarding Token',
}

export type ParameterProps = {
  description?: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  name: string;
  required?: boolean;
  schema: ContentSchemaNoRef;
  style: string;
};

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

type HttpStatusCode = '200' | '201' | '400' | '401' | '404' | string;

/***
 * Information from the open API spec about a single backend API: its method, path, and request / response types.
 */
export type ApiArticle<TContent = Content> = {
  description?: string;
  parameters?: ParameterProps[];
  responses?: Record<HttpStatusCode, RequestOrResponse<TContent>>;
  requestBody?: RequestOrResponse<TContent>;
  security?: Record<SecurityTypes, string[]>[];
  tags?: string[];
  // These are added on top of the open API spec
  id: string;
  method: HttpMethod;
  path: string;
  section: string;
};

// TODO consolidate some of these types even more?
export type ContentSchema = FpExtensions & {
  description?: string;
  enum?: string[];
  example?: Object;
  items?: ContentSchema;
  properties?: Record<string, ContentSchemaNoRef>;
  required?: string[];
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'integer';
  anyOf?: ContentSchema[];
  format?: string;
  $ref?: string;
};

// Same as above, omitting "$ref". Can definitely be cleaned up
export type ContentSchemaNoRef = FpExtensions & {
  description?: string;
  enum?: string[];
  example?: Object;
  items?: ContentSchemaNoRef;
  properties?: Record<string, ContentSchemaNoRef>;
  required?: string[];
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'integer';
  anyOf?: ContentSchemaNoRef[];
  format?: string;
};

export type FpExtensions = {
  /** Added as an extension by our rust library that autogenerates open API schemas */
  x_fp_preview_gate?: TenantPreviewApi;
};
