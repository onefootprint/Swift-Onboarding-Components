import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

const LegalFooter = () => (
  <Typography color="tertiary" sx={{ textAlign: 'center' }} variant="caption-2">
    <Trans
      i18nKey="components.legal-footer.label"
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

export default LegalFooter;
