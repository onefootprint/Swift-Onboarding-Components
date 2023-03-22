import type { Fields, IdDocumentField } from '../../types';

export const getIdDocumentFields = (fields: Fields) => {
  const result: IdDocumentField[] = [];
  Object.entries(fields.id_document).forEach(([key, value]) => {
    if (value) {
      result.push(`id_document.${key}` as unknown as IdDocumentField);
    }
  });
  return result;
};

export default getIdDocumentFields;
