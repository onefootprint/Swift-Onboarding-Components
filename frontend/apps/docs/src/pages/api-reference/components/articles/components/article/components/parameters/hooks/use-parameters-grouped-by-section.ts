import type {
  ParameterProps,
  SchemaProperty,
} from '@/api-reference/api-reference.types';

const filterByIn = (parameters: ParameterProps[], inValue: string) =>
  parameters.filter(parameter => parameter.in === inValue);

const createSchema = (parameter: ParameterProps[], inValue: string) => {
  const params = filterByIn(parameter, inValue);
  const properties: Record<string, SchemaProperty> = {};
  const required: string[] = [];
  params.forEach(param => {
    if (param.required) required.push(param.name);
    properties[param.name] = {
      required: param.required || false,
      type: param.schema.type,
      items: param.schema.items,
      enum: param.schema.enum,
      description: param.description,
    };
  });
  return {
    properties,
    required,
  };
};

const useParametersGroupedBySection = (parameters: ParameterProps[]) => {
  const sections = [
    {
      title: 'path-parameters',
      parameters: createSchema(parameters, 'path'),
    },
    {
      title: 'query-parameters',
      parameters: createSchema(parameters, 'query'),
    },
    {
      title: 'header-parameters',
      parameters: createSchema(parameters, 'header'),
    },
  ].filter(section => Object.keys(section.parameters.properties).length !== 0);
  return sections;
};

export default useParametersGroupedBySection;
