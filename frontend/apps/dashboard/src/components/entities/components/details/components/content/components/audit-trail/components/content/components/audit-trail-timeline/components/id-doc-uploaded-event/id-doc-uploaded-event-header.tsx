import type { IdDocUploadedEventData } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

type IdDocUploadedEventHeaderProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventHeader = ({ data }: IdDocUploadedEventHeaderProps) => {
  const { t } = useTranslation('common');

  return (
    <Stack justify="flex-start" align="center" flexWrap="wrap" gap={2}>
      <Typography variant="body-3" color="tertiary">
        {t(
          `pages.entity.audit-trail.timeline.id-doc-uploaded-event.title.${data.status}` as ParseKeys<'common'>,
        )}
      </Typography>
      <Typography variant="label-3">
        {t(`id_document.${data.documentType}` as ParseKeys<'common'>)}
      </Typography>
    </Stack>
  );
};

export default IdDocUploadedEventHeader;
