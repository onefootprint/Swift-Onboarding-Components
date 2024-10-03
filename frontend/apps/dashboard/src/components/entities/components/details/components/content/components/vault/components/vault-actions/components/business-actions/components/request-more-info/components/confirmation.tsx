import { IcoClock16 } from '@onefootprint/icons';
import { Box, Stack, Text, TextInput } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ConfirmationProps = {
  link: string;
  expiresAt: string;
};

const Confirmation = ({ link, expiresAt }: ConfirmationProps) => {
  const { t } = useTranslation('business-details', {
    keyPrefix: 'request-more-info.confirmation',
  });

  const calculateExpirationDays = (expiresAt: string): number => {
    const expiresInMs = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.round(expiresInMs / (1000 * 3600 * 24));
  };

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
          value={link}
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
          {t('expiration', { duration: calculateExpirationDays(expiresAt) })}
        </Text>
      </Stack>
    </>
  );
};

export default Confirmation;
