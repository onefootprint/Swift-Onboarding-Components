import { isVaultDataDecrypted } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { WithEntityProps } from '@/entity/components/with-entity';

import Field from '../../../field';
import DocumentField from './components/document-field';
import { filterDocumentsByKind, getDocumentType } from './utils';
import useDocumentFields from './utils/use-document-fields';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { data: vault } = useEntityVault(entity.id, entity);
  const { data: documents } = useDocuments(entity.id);
  const fields = useDocumentFields();

  return vault ? (
    <Box>
      {fields.map(field =>
        entity.attributes.includes(field.main) ? (
          <Box key={field.main} sx={{ paddingBottom: 4 }}>
            {isVaultDataDecrypted(vault?.[field.main]) ? (
              <DocumentField
                label={field.label}
                vault={vault}
                documentType={getDocumentType(field.main)}
                documents={filterDocumentsByKind(
                  documents,
                  getDocumentType(field.main),
                )}
              />
            ) : (
              <Field di={field.main} entity={entity} />
            )}
          </Box>
        ) : null,
      )}
    </Box>
  ) : null;
};
export default DocumentFields;
