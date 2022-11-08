import { useTranslation } from '@onefootprint/hooks';
import { IdDocUploadedEvent } from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import React from 'react';

type IdDocUploadedEventHeaderProps = {
  data: IdDocUploadedEvent;
};

const IdDocUploadedEventHeader = ({ data }: IdDocUploadedEventHeaderProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.id-doc-uploaded-event',
  );
  const idDocKindLabel = allT(`id-doc-type.${data.idDocKind}`);

  return (
    <Typography variant="label-3">
      {t('title')} <Tag>{idDocKindLabel}</Tag>
    </Typography>
  );
};

export default IdDocUploadedEventHeader;
