import { useTranslation } from '@onefootprint/hooks';
import { IdDocUploadedEventData } from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import React from 'react';

type IdDocUploadedEventHeaderProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventHeader = ({ data }: IdDocUploadedEventHeaderProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.id-doc-uploaded-event',
  );
  // TODO: https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
  const idDocKindLabel = allT(`id-doc-type.${data.idDocKind ?? 'id_card'}`);

  return (
    <Typography variant="label-3">
      {t('title')} <Tag>{idDocKindLabel}</Tag>
    </Typography>
  );
};

export default IdDocUploadedEventHeader;
