import type { ContentSchema, ContentSchemaNoRef } from 'src/pages/api-reference/api-reference.types';
import useCanAccessPreviewApi from './use-can-access-preview-api';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const useHydrateSchema = (openApiSpec: any) => {
  const canAccessPreviewApi = useCanAccessPreviewApi();

  const schemas: Record<string, ContentSchemaNoRef> = openApiSpec.components.schemas;

  const evaluateSchemaRef = (ref: string) => {
    const parts = ref?.split('/');
    const key = parts[parts.length - 1];
    return schemas[key] as ContentSchemaNoRef | undefined;
  };

  /** Open API request and response schemas may by defined either inline or by a reference to a list of schemas. This recursively dereferenecs all referenced schema and returns a guaranteed schema definition. */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const resolveAllSchemaRefs = (schema: any): any => {
    if (typeof schema !== 'object' || Array.isArray(schema) || !schema) {
      return schema;
    }

    let dereferencedSchema = schema;
    if (schema.$ref) {
      dereferencedSchema = evaluateSchemaRef(schema.$ref);
      if (!dereferencedSchema) {
        throw Error(`Couldn't dereference schema ${schema.$ref}`);
      }
    }

    // Recursively crawl for any values that are schema references and resolve them
    return Object.fromEntries(
      Object.entries(dereferencedSchema).map(([k, v]) => {
        return [k, resolveAllSchemaRefs(v)];
      }),
    );
  };

  /** Filters out feature-gated properties from the provided properties */
  const filterVisibleProperties = (properties?: Record<string, ContentSchemaNoRef>) => {
    if (!properties) return undefined;
    return Object.fromEntries(
      Object.entries(properties).filter(([_, schema]) => canAccessPreviewApi(schema.x_fp_preview_gate)),
    );
  };

  /** Given a schema (that may be a reference), looks up the full schema from the open API spec and applies any filtering to visibile properties on the schema. */
  const hydrateSchema = (schema: ContentSchema) => {
    const dereferencedSchema = resolveAllSchemaRefs(schema) as ContentSchemaNoRef;
    return {
      ...dereferencedSchema,
      properties: filterVisibleProperties(dereferencedSchema.properties),
    };
  };

  return hydrateSchema;
};

export default useHydrateSchema;
