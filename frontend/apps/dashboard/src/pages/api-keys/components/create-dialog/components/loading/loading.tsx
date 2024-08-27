import { Box, Shimmer, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-keys.create' });

  return (
    <Box aria-label={t('form.loading-aria')} width="100%">
      <Stack gap={4} marginBottom={5}>
        <Stack direction="column" gap={3}>
          <SecretKeyLabel />
          <SecretKeyInput />
        </Stack>
        <Stack direction="column" gap={3}>
          <RoleLabel />
          <RoleInput />
        </Stack>
      </Stack>
    </Box>
  );
};

const SecretKeyLabel = () => <Shimmer height="20px" width="110px" />;

const SecretKeyInput = () => <Shimmer height="40px" width="395px" />;

const RoleLabel = () => <Shimmer height="20px" width="99px" />;

const RoleInput = () => <Shimmer height="40px" width="194px" />;

export default Loading;
