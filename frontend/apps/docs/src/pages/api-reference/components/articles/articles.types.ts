export type ResponseContentProps = {
  description: string;
  content: {
    'application/json': {
      schema: {
        $ref: string;
      };
    };
  };
};

export type ResponseProps = {
  code: '200' | '400' | '401' | '403' | '404' | '500';
  description: string;
  content: ResponseContentProps;
};

export type RequestProps = {
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

export type DescriptionProps = {
  description: string;
};

export type SecurityTypes =
  | 'Secret API Key'
  | 'Client Token'
  | 'Dashboard Token';

export type SecurityProps = {
  type: SecurityTypes;
};

export type ParameterProps = {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: {
    type: string;
  };
  style: string;
};

export type ArticleProps = {
  id: string;
  description?: string;
  method?: string;
  parameters?: ParameterProps[];
  path?: string;
  responses?: ResponseProps;
  requestBody?: RequestProps;
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

export type Schemas = string;
