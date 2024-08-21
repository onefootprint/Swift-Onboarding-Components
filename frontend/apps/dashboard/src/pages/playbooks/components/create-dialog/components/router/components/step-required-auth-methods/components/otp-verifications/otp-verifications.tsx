import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Checkbox, InlineAlert, Stack } from '@onefootprint/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const OtpVerifications = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.required-auth',
  });
  const { register } = useFormContext<DataToCollectFormData>();
  const [phone, email] = useWatch<DataToCollectFormData>({
    name: ['requiredAuthMethods.phone', 'requiredAuthMethods.email'],
  });
  const noRequiredAuthMethods = !phone && !email;

  return (
    <Stack flexDirection="column" gap={6}>
      <Stack flexDirection="column" gap={3} paddingLeft={3}>
        <Checkbox label={t('phone')} {...register('requiredAuthMethods.phone')} />
        <Checkbox label={t('email')} {...register('requiredAuthMethods.email')} />
      </Stack>
      {noRequiredAuthMethods ? (
        <>
          <InlineAlert variant="warning">{t('error')}</InlineAlert>
          <input type="hidden" {...register('requiredAuthMethods.hasOptionSelected', { required: true })} />
        </>
      ) : null}
    </Stack>
  );
};

export default OtpVerifications;
