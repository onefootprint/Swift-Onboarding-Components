import { IcoClock16 } from '@onefootprint/icons';
import { Box, Stack, Text, TextInput } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Confirmation = () => {
  const { t } = useTranslation('business-details', {
    keyPrefix: 'request-more-info.confirmation',
  });

  return (
    <>
      <Text variant="label-3" marginBottom={2}>
        {t('title')}
      </Text>
      <Text variant="body-3" color="secondary" marginBottom={5}>
        {t('description')}
      </Text>
      <Box marginBottom={4}>
        <TextInput
          placeholder=""
          value="https://onefootprint.com/kDHjmdjkdsahjkDm"
          size="compact"
          disabled
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        />
      </Box>
      <Stack gap={2}>
        <IcoClock16 color="quaternary" />
        <Text color="quaternary" variant="caption-4">
          {t('expiration', { duration: 3 })}
        </Text>
      </Stack>
    </>
  );
};

export default Confirmation;
