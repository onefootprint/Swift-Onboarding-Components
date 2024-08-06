import { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Checkbox, InlineAlert, Stack, Text } from '@onefootprint/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const OtpVerifications = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create',
  });
  const { register } = useFormContext<DataToCollectFormData>();
  const [phone, email] = useWatch<DataToCollectFormData>({
    name: ['requiredAuthMethods.phone', 'requiredAuthMethods.email'],
  });
  const noRequiredAuthMethods = !phone && !email;

  return (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={2}>
        <Text variant="label-1" color="secondary">
          {t('required-auth.title')}
        </Text>
        <Text variant="body-2" color="secondary">
          {t('required-auth.subtitle')}
        </Text>
      </Stack>
      <Stack flexDirection="column" gap={3} paddingLeft={3}>
        <Checkbox label={t('required-auth.phone')} {...register('requiredAuthMethods.phone')} />
        <Checkbox label={t('required-auth.email')} {...register('requiredAuthMethods.email')} />
      </Stack>
      {noRequiredAuthMethods ? (
        <>
          <InlineAlert variant="warning">{t('required-auth.error')}</InlineAlert>
          <input type="hidden" {...register('requiredAuthMethods.hasOptionSelected', { required: true })} />
        </>
      ) : null}
    </Stack>
  );
};

export default OtpVerifications;
