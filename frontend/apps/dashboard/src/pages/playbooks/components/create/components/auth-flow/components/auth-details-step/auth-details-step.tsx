import { IcoEmail16, IcoSmartphone216 } from '@onefootprint/icons';
import { Box, Checkbox, InlineAlert, Stack, Text } from '@onefootprint/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Header from '../../../header';
import type { AuthDetailsFormData } from './auth-details-step.types';

export type AuthDetailsStepProps = {
  defaultValues: AuthDetailsFormData;
  onBack: () => void;
  onSubmit: (data: AuthDetailsFormData) => void;
};

const AuthDetailsStep = ({
  onSubmit,
  onBack,
  defaultValues = {
    email: false,
    phone: true,
  },
}: AuthDetailsStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.settings-auth' });
  const { handleSubmit, register, control } = useForm<AuthDetailsFormData>({ defaultValues });
  const [phone, email] = useWatch({ control, name: ['phone', 'email'] });
  const noRequiredAuthMethods = !phone && !email;

  return (
    <Stack direction="column" gap={7} width="520px" whiteSpace="pre-wrap">
      <Header title={t('title')} subtitle={t('subtitle')} />
      <form
        id="playbook-form"
        onSubmit={handleSubmit(onSubmit)}
        onReset={e => {
          e.preventDefault();
          onBack();
        }}
      >
        <Stack flexDirection="column" gap={4}>
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
                  <Text variant="body-3" color="secondary">
                    {t('sign-up.email.label')}
                  </Text>
                </Stack>
                <Stack gap={3} alignItems="center">
                  <IcoSmartphone216 />
                  <Text variant="body-3" color="secondary">
                    {t('sign-up.phone-number.label')}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Box>
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
                <Checkbox label={t('sign-in.otp.phone')} {...register('phone')} />
                <Checkbox label={t('sign-in.otp.email')} {...register('email')} />
              </Stack>
              {noRequiredAuthMethods ? (
                <>
                  <InlineAlert variant="warning">{t('sign-in.otp.error')}</InlineAlert>
                  <input type="hidden" {...register('hasOptionSelected', { required: true })} />
                </>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </form>
    </Stack>
  );
};

export default AuthDetailsStep;
