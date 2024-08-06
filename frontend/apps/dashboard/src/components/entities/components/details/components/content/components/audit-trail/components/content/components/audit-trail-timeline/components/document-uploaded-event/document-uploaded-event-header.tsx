import type { DocumentUploadedEventData } from '@onefootprint/types';
import { DocumentRequestKind, IdDocStatus } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

type DocumentUploadedEventHeaderProps = {
  data: DocumentUploadedEventData;
};

const DocumentUploadedEventHeader = ({ data }: DocumentUploadedEventHeaderProps) => {
  const { t } = useTranslation('common');

  const statusT: Record<IdDocStatus, string> = {
    [IdDocStatus.complete]: t(`pages.entity.audit-trail.timeline.document-uploaded-event.title.complete`),
    [IdDocStatus.pending]: t(`pages.entity.audit-trail.timeline.document-uploaded-event.title.pending`),
    [IdDocStatus.failed]: t(`pages.entity.audit-trail.timeline.document-uploaded-event.title.failed`),
  };

  let documentType;
  if (data.config.kind === DocumentRequestKind.Custom) {
    documentType = data.config.data.name;
  } else {
    documentType = t(`id_document.${data.documentType}` as ParseKeys<'common'>);
  }

  return (
    <Stack justify="flex-start" align="center" flexWrap="wrap" gap={2}>
      <Text variant="body-3" color="tertiary">
        {statusT[data.status]}
      </Text>
      <Text variant="label-3">{documentType}</Text>
    </Stack>
  );
};

export default DocumentUploadedEventHeader;
