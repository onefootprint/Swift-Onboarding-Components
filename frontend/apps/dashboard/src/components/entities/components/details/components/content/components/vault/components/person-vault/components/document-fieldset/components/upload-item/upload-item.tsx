import { IcoLock16 } from '@onefootprint/icons';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import useIdDocText from 'src/hooks/use-id-doc-text';
import type { UploadWithDocument } from '../../types';
import DocumentStatusBadge from '../document-status-badge';

export type UploadItemProps = {
  upload: UploadWithDocument;
};

const UploadItem = ({ upload: { timestamp, identifier, document } }: UploadItemProps) => {
  const getDocText = useIdDocText();

  return (
    <Stack justify="space-between">
      <Stack align="center" gap={3}>
        <Text variant="snippet-3" color="tertiary">
          {format(new Date(timestamp), 'MM/dd/yy h:mma')}
        </Text>
        <Text tag="span" variant="label-3">
          ⋅
        </Text>
        <Text variant="snippet-2">
          {document.kind === SupportedIdDocTypes.custom ? identifier : getDocText(document.kind)}
        </Text>
        <DocumentStatusBadge document={document} />
      </Stack>
      <Stack align="center" gap={2}>
        <IcoLock16 />
        <Text variant="body-3">•••••••••</Text>
      </Stack>
    </Stack>
  );
};

export default UploadItem;
