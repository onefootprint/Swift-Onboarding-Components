export type Content = {
  description?: string;
  content: {
    'application/json': {
      schema: ContentSchema;
    };
  };
  required?: boolean;
};

export type PathProps = {
  url: string;
  type: string;
};

export type SecurityTypes = 'Secret API Key' | 'Client Token';

export type ParameterProps = {
  description?: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  name: string;
  required?: boolean;
  schema: ContentSchema;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  example?: any;
  style: string;
};

export type Article = {
  description?: string;
  parameters?: ParameterProps[];
  responses?: Record<string, Content>;
  requestBody?: Content;
  security?: Record<SecurityTypes, string[]>[];
  tags?: string[];
  // These are added on top of the open API spec
  id: string;
  method: 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';
  path: string;
  section: string;
};

export type ParametersProps = {
  parameters: ParameterProps[];
};

// TODO consolidate some of these types even more?
export type ContentSchema = {
  description?: string;
  enum?: string[];
  example?: Object;
  items?: ContentSchema;
  properties?: Record<string, ContentSchema>;
  required?: string[];
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'integer';
  format?: string;
  $ref?: string;
  // This isn't an open API field - this is autogenerated in some contexts. Can clean up
  isRequired?: boolean;
};
