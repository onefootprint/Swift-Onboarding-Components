import type { Document } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import DocumentStatusBadge from '../document-status-badge';

type ItemLabelProps = {
  document: Document | Omit<Document, 'uploads'>;
  timestamp: string;
  title: string;
};

const ItemLabel = ({ document, timestamp, title }: ItemLabelProps) => (
  <Stack align="center" gap={3}>
    <Text variant="snippet-3" color="tertiary">
      {format(new Date(timestamp), 'MM/dd/yy h:mma')}
    </Text>
    <Text tag="span" variant="label-3">
      ⋅
    </Text>
    <Text variant="snippet-2">{title}</Text>
    <DocumentStatusBadge document={document} />
  </Stack>
);

export default ItemLabel;
