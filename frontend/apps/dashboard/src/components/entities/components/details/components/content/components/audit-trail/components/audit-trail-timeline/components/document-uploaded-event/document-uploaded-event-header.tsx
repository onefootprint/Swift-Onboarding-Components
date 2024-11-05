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
  const { t: entityT } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.document-uploaded-event',
  });

  const statusT: Record<IdDocStatus, string> = {
    [IdDocStatus.complete]: entityT('title.complete'),
    [IdDocStatus.pending]: entityT('title.pending'),
    [IdDocStatus.failed]: entityT('title.failed'),
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
