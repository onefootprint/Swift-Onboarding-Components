import { isVaultDataDecrypted } from '@onefootprint/types';
import { Box, Stack } from '@onefootprint/ui';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import useDocuments from '@/entity/hooks/use-documents';

import Field from '../../../field';
import DocumentField from './components/document-field';
import DocumentStatusBadge from './components/document-status-badge';
import { filterDocumentsByKind, getDocumentType } from './utils';
import useDocumentFields from './utils/use-document-fields';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { data: vaultWithTransforms } = useEntityVault(entity.id, entity);
  const vault = vaultWithTransforms?.vault;
  const { data: documents } = useDocuments(entity.id);
  const fields = useDocumentFields();

  return vault ? (
    <Stack gap={4} direction="column">
      {fields.map(field => {
        if (!entity.attributes.includes(field.main)) {
          return null;
        }
        const docType = getDocumentType(field.main);
        const filteredDocs = filterDocumentsByKind(documents, docType);
        return (
          <Box key={field.main}>
            {isVaultDataDecrypted(vault?.[field.main]) ? (
              <DocumentField label={field.label} vault={vault} documentType={docType} documents={filteredDocs} />
            ) : (
              <Field
                di={field.main}
                entity={entity}
                status={<DocumentStatusBadge documents={filteredDocs} documentType={docType} />}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  ) : null;
};
export default DocumentFields;
