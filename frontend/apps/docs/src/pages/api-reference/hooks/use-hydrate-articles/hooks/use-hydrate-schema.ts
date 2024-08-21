import type { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import type { ContentSchema, ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';
import useCanAccessPreviewApi from './use-can-access-preview-api';

// TODO unit tests
/** The backend serializes when fields are gated by preview APIs inside markdown comments. Here, we extract out if a given field's description indicates that the field should only be displayed behind a TenantPreviewApi gate. */
export const getPreviewApiGateFromDescription = (description: string) => {
  const gatedRegex = /gated\(([A-Za-z_-]+)\)/;
  return gatedRegex.exec(description)?.[1] as TenantPreviewApi | undefined;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const useHydrateSchema = (openApiSpec: any) => {
  const canAccessPreviewApi = useCanAccessPreviewApi();

  const schemas: Record<string, ContentSchemaNoRef> = openApiSpec.components.schemas;

  const evaluateSchemaRef = (ref: string) => {
    const parts = ref?.split('/');
    const key = parts[parts.length - 1];
    return schemas[key] as ContentSchemaNoRef | undefined;
  };

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

  /** Given a schema (that may be a reference), looks up the full schema from the open API spec and applies any filtering to visibile properties on the schema. */
  const hydrateSchema = (schema: ContentSchema) => {
    const dereferencedSchema = dereferenceSchema(schema);
    return {
      ...dereferencedSchema,
      properties: filterVisibleProperties(dereferencedSchema.properties),
    };
  };

  return hydrateSchema;
};

export default useHydrateSchema;
