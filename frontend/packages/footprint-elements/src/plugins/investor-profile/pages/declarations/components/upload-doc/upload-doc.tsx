import { useTranslation } from '@onefootprint/hooks';
import { Divider, Typography } from '@onefootprint/ui';
import React from 'react';

const UploadDoc = () => {
  const { t } = useTranslation('pages.declarations.form.doc-upload');

  return (
    <>
      <Divider />
      {/* TODO: add doc upload here */}
      DOC UPLOAD
      <Typography variant="caption-4" color="tertiary">
        {t('disclaimer')}
      </Typography>
      <Divider />
    </>
  );
};

export default UploadDoc;
