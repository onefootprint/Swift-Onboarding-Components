import { type Document, SupportedIdDocTypes } from '@onefootprint/types';
import { CodeInline, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import DocumentStatusBadge from '../document-status-badge';

type ItemLabelProps = {
  document: Document | Omit<Document, 'uploads'>;
  timestamp: string;
  title: string;
};

const ItemLabel = ({ document, timestamp, title }: ItemLabelProps) => (
  <Stack align="center" gap={2}>
    <Text variant="snippet-1" color="tertiary">
      {format(new Date(timestamp), 'MM/dd/yy h:mma')}
    </Text>
    <Text tag="span" variant="label-3">
      ⋅
    </Text>
    {document.kind === SupportedIdDocTypes.custom ? (
      <CodeInline>{title}</CodeInline>
    ) : (
      <Text variant="body-3">{title}</Text>
    )}
    <DocumentStatusBadge document={document} />
  </Stack>
);

export default ItemLabel;
