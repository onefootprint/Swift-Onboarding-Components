import type { ContentSchemaNoRef, ParameterProps } from 'src/pages/api-reference/api-reference.types';

const filterByIn = (parameters: ParameterProps[], inValue: string) =>
  parameters.filter(parameter => parameter.in === inValue);

const createSchema = (parameter: ParameterProps[], inValue: string): ContentSchemaNoRef => {
  const params = filterByIn(parameter, inValue);
  const properties: Record<string, ContentSchemaNoRef> = {};
  const requiredForSchema: string[] = params.filter(param => param.required).map(param => param.name);
  params.forEach(param => {
    properties[param.name] = {
      ...param.schema,
      description: param.description,
    };
  });
  // Putting together our own ContentSchema-esque object since rendering headers/query params/etc
  // is a lot like rendering JSON bodies
  return {
    properties,
    required: requiredForSchema,
    type: 'object',
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
  ].filter(section => Object.keys(section.parameters.properties || []).length !== 0);
  return sections;
};

export default useParametersGroupedBySection;
