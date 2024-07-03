import { SupportedIdDocTypes } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import useCurrentEntityDocuments from '@/entity/hooks/use-current-entity-documents';

import DocumentFieldOrPlaceholder from './components/document-field-or-placeholder';
import { filterDocumentsByKind } from './utils';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { data: vaultWithTransforms } = useEntityVault(entity.id, entity);
  const vault = vaultWithTransforms?.vault;
  const { data: documents } = useCurrentEntityDocuments();

  return vault ? (
    <Stack gap={4} direction="column">
      {Object.values(SupportedIdDocTypes)
        // Custom documents are displayed in a different section for now
        .filter(k => k !== SupportedIdDocTypes.custom)
        .map(docType => {
          const filteredDocs = filterDocumentsByKind(documents, docType);
          if (!filteredDocs.length) {
            return;
          }
          return <DocumentFieldOrPlaceholder kind={docType} vault={vault} entity={entity} documents={filteredDocs} />;
        })}
    </Stack>
  ) : null;
};

export default DocumentFields;
