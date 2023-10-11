import { isVaultDataDecrypted } from '@onefootprint/types';
import { Box, Stack } from '@onefootprint/ui';
import React from 'react';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';

import Field from '../../../field';
import DocumentField from './components/document-field';
import DocumentStatusBadge from './components/document-status-badge';
import {
  filterDocumentsByKind,
  getDocumentStatus,
  getDocumentType,
} from './utils';
import useDocumentFields from './utils/use-document-fields';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { data: vault } = useEntityVault(entity.id, entity);
  const { data: documents } = useDocuments(entity.id);
  const fields = useDocumentFields();

  return vault ? (
    <Stack gap={4} direction="column">
      {fields.map(field => {
        if (!entity.attributes.includes(field.main)) {
          return null;
        }
        const docStatus = getDocumentStatus({
          documents,
          documentType: getDocumentType(field.main),
        });
        return (
          <Box key={field.main}>
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
              <Field
                di={field.main}
                entity={entity}
                status={docStatus && <DocumentStatusBadge status={docStatus} />}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  ) : null;
};
export default DocumentFields;
