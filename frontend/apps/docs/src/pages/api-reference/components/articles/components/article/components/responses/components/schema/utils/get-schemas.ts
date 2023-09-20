import type { Schemas } from 'src/pages/api-reference/components/articles/articles.types';
import staticAPIData from 'src/pages/api-reference/server/api-docs.json';
import staticPreviewData from 'src/pages/api-reference/server/api-preview-docs.json';

const getSchema = (schemaKey: Schemas) => {
  const schema =
    staticAPIData.components.schemas[
      schemaKey as keyof typeof staticAPIData.components.schemas
    ];
  const previewSchema =
    staticPreviewData.components.schemas[
      schemaKey as keyof typeof staticPreviewData.components.schemas
    ];
  return schema || previewSchema || null;
};

export default getSchema;
