export type Content = {
  description?: string;
  content: {
    'application/json': {
      schema: {
        $ref: string;
      };
    };
  };
};

export type PathProps = {
  url: string;
  type: string;
};

export type SecurityTypes =
  | 'Secret API Key'
  | 'Client Token'
  | 'Dashboard Token';

export type SecurityProps = {
  type: SecurityTypes;
};

export type ParameterProps = {
  description?: string;
  in: string;
  name: string;
  required?: boolean;
  schema: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    items: SchemaPropertyItem;
    enum?: string[];
  };
  style: string;
};

export type ArticleProps = {
  id: string;
  description?: string;
  method?: string;
  parameters?: ParameterProps[];
  path?: string;
  responses?: Record<string, Content>;
  requestBody?: Content;
  security?: SecurityTypes[];
  tags?: string[];
};

export type ParametersProps = {
  parameters: ParameterProps[];
};

export type ArticlesProps = {
  staticArticles: ArticleProps[];
  staticPreviewArticles: ArticleProps[];
};

export type SchemaPropertyItem = {
  description?: string;
  enum?: string[];
  format?: string;
  properties?: Record<string, SchemaPropertyItem>;
  required?: string[];
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
};

export type SchemaProperty = {
  description?: string;
  enum?: string[];
  example?: Object;
  items?: SchemaPropertyItem;
  properties?: Record<string, SchemaPropertyItem>;
  required?: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
};

export type ComponentSchema = {
  description?: string;
  example?: Object;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  type?: 'object' | 'string' | 'array';
};
