import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const PhoneNumberInput = () => {
  const { t } = useTranslation('pages.phone-identification.phone-number-input');

  return (
    <Box gap={7} marginBottom={7}>
      <TextInput
        autoFocus
        data-private
        label={t('label')}
        placeholder={t('placeholder')}
      />
      <Button variant="primary">{t('cta')}</Button>
    </Box>
  );
};
export default PhoneNumberInput;
