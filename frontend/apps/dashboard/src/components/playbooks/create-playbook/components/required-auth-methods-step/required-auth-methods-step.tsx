import { Checkbox, InlineAlert, Stack } from '@onefootprint/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Header from '../header';
import type { RequiredAuthMethodsFormData } from './required-auth-methods-step.types';

export type RequiredAuthMethodsStep = {
  defaultValues: RequiredAuthMethodsFormData;
  onBack: () => void;
  onSubmit: (data: RequiredAuthMethodsFormData) => void;
};

const RequiredAuthMethodsStep = ({ defaultValues, onBack, onSubmit }: RequiredAuthMethodsStep) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.required-auth' });
  const { control, handleSubmit, register } = useForm<RequiredAuthMethodsFormData>({ defaultValues });
  const [phone, email] = useWatch({ control, name: ['phone', 'email'] });
  const noRequiredAuthMethods = !phone && !email;

  return (
    <Stack flexDirection="column" gap={8}>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <form
        id="playbook-form"
        onSubmit={handleSubmit(onSubmit)}
        onReset={event => {
          event.preventDefault();
          onBack();
        }}
      >
        <Stack flexDirection="column" gap={6}>
          <Stack flexDirection="column" gap={3}>
            <Checkbox label={t('phone')} {...register('phone')} />
            <Checkbox label={t('email')} {...register('email')} />
          </Stack>
          {noRequiredAuthMethods ? (
            <>
              <InlineAlert variant="warning">{t('error')}</InlineAlert>
              <input type="hidden" {...register('hasOptionSelected', { required: true })} />
            </>
          ) : null}
        </Stack>
      </form>
    </Stack>
  );
};

export default RequiredAuthMethodsStep;
