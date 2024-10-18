import { IcoCheckCircle40 } from '@onefootprint/icons';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import { Box, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Complete = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.complete' });

  return (
    <Stack
      flexDirection="column"
      position="relative"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <NavigationHeader />
      <IcoCheckCircle40 color="success" />
      <Box marginBottom={4} />
      <HeaderTitle
        display="flex"
        flexDirection="column"
        gap={4}
        subtitle={t('subtitle')}
        title={t('title')}
        zIndex={3}
      />
      <Box />
    </Stack>
  );
};

export default Complete;
