import type { Document } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import { type VariantProps, cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import getDocumentStatus, { DocumentStatus } from '../../../../utils/get-document-status';
type DocumentStatusBadgeProps = {
  document: Omit<Document, 'uploads'>;
};

const badge = cva(['whitespace-nowrap'], {
  variants: {
    variant: {
      neutral: ['bg-neutral-100', 'text-neutral-700'],
      error: ['bg-error-100', 'text-error-700'],
      warning: ['bg-warning-100', 'text-warning-700'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

const DocStatusToVariant: Record<DocumentStatus, VariantProps<typeof badge>['variant']> = {
  [DocumentStatus.UploadedViaApi]: 'neutral',
  [DocumentStatus.UploadFailed]: 'error',
  [DocumentStatus.UploadAbandoned]: 'neutral',
  [DocumentStatus.UploadIncomplete]: 'warning',
  [DocumentStatus.PendingMachineReview]: 'warning',
  [DocumentStatus.ReviewedByMachine]: 'neutral',
  [DocumentStatus.PendingHumanReview]: 'error',
  [DocumentStatus.ReviewedByHuman]: 'neutral',
};

const DocumentStatusBadge = ({ document }: DocumentStatusBadgeProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.status',
  });
  const status = getDocumentStatus(document);

  if (!status) return null;

  return (
    <Badge variant={DocStatusToVariant[status]}>
      <p className={badge({ variant: DocStatusToVariant[status] })}>{t(status)}</p>
    </Badge>
  );
};

export default DocumentStatusBadge;
