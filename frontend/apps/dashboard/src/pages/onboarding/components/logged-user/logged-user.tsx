import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type LoggedUserProps = {
  email: string;
};

const LoggedUser = ({ email }: LoggedUserProps) => {
  const { t } = useTranslation('pages.onboarding');

  return (
    <Box sx={{ userSelect: 'none' }}>
      <Typography color="tertiary" variant="body-3">
        {t('logged-as')}{' '}
        <Typography variant="body-3" as="span">
          {email}
        </Typography>
      </Typography>
    </Box>
  );
};

export default LoggedUser;
