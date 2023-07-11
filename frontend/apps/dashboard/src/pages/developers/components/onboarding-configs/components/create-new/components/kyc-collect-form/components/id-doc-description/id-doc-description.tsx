import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

const IdDocDescription = () => (
  <Typography variant="body-3" color="tertiary">
    <Trans
      i18nKey="pages.developers.onboarding-configs.create-new.kyc-collect-form.add-ons.document-description"
      components={{
        a: (
          <Link
            href="http://www.onefootprint.com/supported-id-documents"
            rel="noopener noreferrer"
            target="_blank"
          />
        ),
      }}
    />
  </Typography>
);

export default IdDocDescription;
