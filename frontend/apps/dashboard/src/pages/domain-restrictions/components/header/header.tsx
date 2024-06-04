import { IcoLock24, IcoLockOpen24 } from '@onefootprint/icons';
import { Badge, Box, Shimmer, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  hasRestrictions: boolean;
  isLoading: boolean;
};

const Header = ({ hasRestrictions, isLoading }: HeaderProps) => {
  const { t } = useTranslation('domain-restrictions');

  return (
    <Stack direction="column" gap={4} width="100%">
      <Stack justify="space-between">
        <Stack gap={3} justify="start" align="center">
          {hasRestrictions ? <IcoLock24 /> : <IcoLockOpen24 />}
          <Text variant="label-3">{t('header.title')}</Text>
        </Stack>
        {isLoading ? (
          <Shimmer height="26px" width="145px" borderRadius="xl" />
        ) : (
          <Box>
            {hasRestrictions ? (
              <Badge variant="warning">{t('restrictions-added')}</Badge>
            ) : (
              <Badge variant="info">{t('restrictions-not-added')}</Badge>
            )}
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default Header;
