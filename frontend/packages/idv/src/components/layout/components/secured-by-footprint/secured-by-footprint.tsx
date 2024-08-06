import { IcoFootprintShield16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const SecuredByFootprint = () => {
  const { t } = useTranslation('idv');
  return (
    <Stack justify="center" align="center">
      <IcoFootprintShield16 color="secondary" />
      <Stack marginLeft={2}>
        <Text variant="caption-1" color="secondary">
          {t('global.components.layout.secured-by-footprint')}
        </Text>
      </Stack>
    </Stack>
  );
};

export default SecuredByFootprint;
