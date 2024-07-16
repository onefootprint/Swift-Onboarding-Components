import { IcoEmail24 } from '@onefootprint/icons'; // TODO: Use IcoEmail24 that is not available in mobile icon library yet
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

export type EmailPreviewProps = {
  email?: string;
  onEdit?: () => void;
};

const EmailPreview = ({ email, onEdit }: EmailPreviewProps) => {
  const { t } = useTranslation('pages.phone-identification.email-preview');

  return email ? (
    <Box
      display="flex"
      backgroundColor="secondary"
      gap={4}
      padding={5}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="default"
      marginBottom={7}
    >
      <Box display="flex" flexDirection="row" alignItems="center" gap={3} maxWidth="60%">
        <IcoEmail24 />
        <Typography variant="label-3" color="primary">
          {email}
        </Typography>
      </Box>
      <LinkButton size="compact" onPress={onEdit}>
        {t('change-email')}
      </LinkButton>
    </Box>
  ) : null;
};

export default EmailPreview;
