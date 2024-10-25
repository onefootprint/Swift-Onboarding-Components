import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { getErrorMessage } from '@onefootprint/request';
import type { Document, Entity } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import useUploadsAndDocuments from '../../hooks/use-uploads-and-documents';
import type { UploadWithDocument } from '../../types';
import LicenseItem from '../license-item';
import UploadItem from '../upload-item';

type ContentProps = {
  entity: Entity;
};

const Content = ({ entity }: ContentProps) => {
  const seqno = useEntitySeqno();
  const { data: uploadsAndDocuments, error } = useUploadsAndDocuments(entity.id, seqno);
  const { licenseDocuments, uploadsWithDocuments } = uploadsAndDocuments || {};
  const { data: vaultWithTransforms } = useEntityVault(entity.id, entity);
  const { vault } = vaultWithTransforms || {};

  return (
    <>
      {error && getErrorMessage(error)}
      {vault && uploadsAndDocuments && (
        <>
          <Stack direction="column" gap={4}>
            {licenseDocuments
              ? licenseDocuments.map((document: Document) => (
                  <LicenseItem key={document.startedAt} entity={entity} document={document} vault={vault} />
                ))
              : null}
            {uploadsWithDocuments
              ? uploadsWithDocuments.map((upload: UploadWithDocument) => (
                  <UploadItem key={upload.documentId} entity={entity} upload={upload} vault={vault} />
                ))
              : null}
          </Stack>
        </>
      )}
    </>
  );
};

export default Content;
