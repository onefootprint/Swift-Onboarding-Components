import { type Document, SupportedIdDocTypes } from '@onefootprint/types';
import { CodeInline } from '@onefootprint/ui';
import { formatDate } from 'date-fns';
import DocumentStatusBadge from '../document-status-badge';

type ItemLabelProps = {
  document: Document | Omit<Document, 'uploads'>;
  timestamp: string;
  title: string;
};

const ItemLabel = ({ document, timestamp, title }: ItemLabelProps) => (
  <div className="flex items-center gap-2">
    <p className="text-snippet-2 text-tertiary">{formatDate(new Date(timestamp), 'MM/dd/yy h:mm a')}</p>
    <span className="text-label-3">⋅</span>
    {document.kind === SupportedIdDocTypes.custom ? (
      <CodeInline>{title}</CodeInline>
    ) : (
      <p className="truncate text-body-3">{title}</p>
    )}
    <DocumentStatusBadge document={document} />
  </div>
);

export default ItemLabel;
