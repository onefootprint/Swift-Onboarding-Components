import { IcoEmail16, IcoSmartphone216 } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const SignUp = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-auth',
  });

  return (
    <Box
      borderWidth={1}
      paddingInline={6}
      paddingBlock={5}
      borderColor="tertiary"
      borderStyle="solid"
      borderRadius="default"
    >
      <Stack flexDirection="column" gap={4}>
        <Text variant="label-3" color="primary">
          {t('sign-up.title')}
        </Text>

        <Stack flexDirection="column" gap={3}>
          <Stack gap={3} alignItems="center">
            <IcoEmail16 />
            <Text variant="body-4" color="secondary">
              {t('sign-up.email.label')}
            </Text>
          </Stack>

          <Stack gap={3} alignItems="center">
            <IcoSmartphone216 />
            <Text variant="body-4" color="secondary">
              {t('sign-up.phone-number.label')}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SignUp;
