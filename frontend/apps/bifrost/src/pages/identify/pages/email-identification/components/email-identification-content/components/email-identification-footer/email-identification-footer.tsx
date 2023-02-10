import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

const EmailIdentificationFooter = () => (
  <Typography color="tertiary" sx={{ textAlign: 'center' }} variant="caption-1">
    <Trans
      i18nKey="pages.email-identification.footer"
      components={{
        termsLink: (
          <Link
            href="https://www.onefootprint.com/terms-of-service"
            rel="noopener noreferrer"
            target="_blank"
          />
        ),
        privacyPolicyLink: (
          <Link
            href="https://www.onefootprint.com/privacy-policy"
            rel="noopener noreferrer"
            target="_blank"
          />
        ),
      }}
    />
  </Typography>
);

export default EmailIdentificationFooter;
