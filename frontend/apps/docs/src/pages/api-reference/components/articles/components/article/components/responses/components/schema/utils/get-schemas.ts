import staticAPIData from 'src/pages/api-reference/assets/api-docs.json';
import staticPreviewData from 'src/pages/api-reference/assets/api-preview-docs.json';
import type { Schemas } from 'src/pages/api-reference/components/articles/articles.types';

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
