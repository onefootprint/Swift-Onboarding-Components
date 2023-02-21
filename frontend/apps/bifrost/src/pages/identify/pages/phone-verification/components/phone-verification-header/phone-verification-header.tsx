import { HeaderTitle } from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import React from 'react';

export type PhoneVerificationHeaderProps = {
  phone?: string;
  userFound?: boolean;
};

const PhoneVerificationHeader = ({
  phone,
  userFound,
}: PhoneVerificationHeaderProps) => {
  const { t } = useTranslation('pages.phone-verification');
  const scrubbedPhoneNumber = phone?.replaceAll('*', '•').replaceAll('-', ' ');

  return (
    <Box>
      <HeaderTitle
        data-private
        title={userFound ? t('title.existing-user') : t('title.new-user')}
        subtitle={t('subtitle', {
          scrubbedPhoneNumber,
        })}
      />
    </Box>
  );
};

export default PhoneVerificationHeader;
