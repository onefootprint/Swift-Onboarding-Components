import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { getErrorMessage } from '@onefootprint/request';
import { Stack } from '@onefootprint/ui';

import type { Entity } from '@onefootprint/types';
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
        <Stack direction="column" gap={3}>
          {uploadsWithDocuments.map(upload => (
            <UploadItem key={upload.documentId} upload={upload} />
          ))}
        </Stack>
      )}
    </>
  );
};

export default Content;
