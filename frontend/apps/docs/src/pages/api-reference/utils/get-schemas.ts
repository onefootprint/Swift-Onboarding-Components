import type { ComponentSchema, Content } from '../api-reference.types';
import staticAPIData from '../assets/api-docs.json';
import staticPreviewData from '../assets/api-preview-docs.json';

const getSchema = (schemaKey: string) => {
  const schema = staticAPIData.components.schemas[
    schemaKey as keyof typeof staticAPIData.components.schemas
  ] as ComponentSchema | undefined;
  const previewSchema = staticPreviewData.components.schemas[
    schemaKey as keyof typeof staticPreviewData.components.schemas
  ] as ComponentSchema | undefined;

  return schema || previewSchema || null;
};

export const getSchemaFromComponent = (component?: Content) => {
  if (!component) return null;
  const path = component.content['application/json'].schema.$ref;
  if (path) {
    const parts = path.split('/');
    const key = parts[parts.length - 1];
    return getSchema(key);
  }
  return null;
};

export default getSchema;
