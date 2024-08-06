import { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Box, Checkbox, InlineAlert, Stack, Text } from '@onefootprint/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const SignInMethods = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-auth',
  });
  const { register } = useFormContext<DataToCollectFormData>();
  const [phone, email] = useWatch<DataToCollectFormData>({
    name: ['requiredAuthMethods.phone', 'requiredAuthMethods.email'],
  });
  const noRequiredAuthMethods = !phone && !email;

  return (
    <Box
      borderWidth={1}
      paddingInline={6}
      paddingBlock={5}
      borderColor="tertiary"
      borderStyle="solid"
      borderRadius="default"
    >
      <Stack flexDirection="column" gap={6}>
        <Stack flexDirection="column" gap={2}>
          <Text variant="label-3" color="primary">
            {t('sign-in.title')}
          </Text>
          <Text variant="body-3" color="secondary">
            {t('sign-in.subtitle')}
          </Text>
        </Stack>
        <Stack flexDirection="column" gap={3} paddingLeft={3}>
          <Checkbox label={t('sign-in.otp.phone')} {...register('requiredAuthMethods.phone')} />
          <Checkbox label={t('sign-in.otp.email')} {...register('requiredAuthMethods.email')} />
        </Stack>
        {noRequiredAuthMethods ? (
          <>
            <InlineAlert variant="warning">{t('sign-in.otp.error')}</InlineAlert>
            <input type="hidden" {...register('requiredAuthMethods.hasOptionSelected', { required: true })} />
          </>
        ) : null}
      </Stack>
    </Box>
  );
};

export default SignInMethods;
