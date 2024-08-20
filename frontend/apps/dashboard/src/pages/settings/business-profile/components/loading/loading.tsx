import { Box, Shimmer, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.business-profile',
  });

  return (
    <Box aria-label={t('loading-aria')}>
      <Stack direction="column" gap={9}>
        <Stack direction="column" gap={7}>
          <Avatar />
          <Stack direction="column" gap={10}>
            <Stack direction="column" gap={5} style={{ maxWidth: '640px' }}>
              <InputRow />
              <InputRow />
              <InputRow />
            </Stack>
            <Stack direction="column" gap={7} style={{ maxWidth: '640px' }}>
              <Stack direction="column" gap={3}>
                <Label />
                <Shimmer height="20px" width="300px" borderRadius="default" />
              </Stack>
              <Stack gap={5} direction="column">
                <InputRow />
                <InputRow />
                <InputRow />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Shimmer height="40px" width="120px" borderRadius="default" />
      </Stack>
    </Box>
  );
};

const Avatar = () => <Shimmer height="80px" width="80px" borderRadius="default" />;

const Label = () => <Shimmer height="24px" width="143px" borderRadius="default" />;

const InputRow = () => (
  <Stack direction="row" justify="space-between" align="center">
    <Label />
    <Shimmer height="36px" width="300px" borderRadius="default" />
  </Stack>
);

export default Loading;
