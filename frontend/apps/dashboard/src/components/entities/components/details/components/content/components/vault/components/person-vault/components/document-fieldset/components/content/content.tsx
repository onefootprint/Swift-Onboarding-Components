import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { getErrorMessage } from '@onefootprint/request';
import type { Entity } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import useUploadsWithDocuments from '../../hooks/use-uploads-with-documents';
import UploadItem from '../upload-item';

type ContentProps = {
  entity: Entity;
};

const Content = ({ entity }: ContentProps) => {
  const seqno = useEntitySeqno();
  const { data: uploadsWithDocuments, error } = useUploadsWithDocuments(entity.id, seqno);

  return (
    <>
      {error && getErrorMessage(error)}
      {uploadsWithDocuments && (
        <Stack direction="column" gap={4}>
          {uploadsWithDocuments.map(upload => (
            <UploadItem key={upload.documentId} entity={entity} upload={upload} />
          ))}
        </Stack>
      )}
    </>
  );
};

export default Content;
