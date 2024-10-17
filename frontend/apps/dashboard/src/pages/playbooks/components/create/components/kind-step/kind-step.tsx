import { IcoIdCard24, IcoShield24, IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import { OnboardingConfigKind } from '@onefootprint/types';
import { RadioSelect, Stack } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useSession from 'src/hooks/use-session';

import Header from '../header';

type FormData = {
  kind: OnboardingConfigKind;
};

export type KindStepProps = {
  defaultValues: FormData;
  onSubmit: (formData: FormData) => void;
};

const KindStep = ({ onSubmit, defaultValues }: KindStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.kind' });
  const {
    data: { org },
  } = useSession();
  const { handleSubmit, control } = useForm<FormData>({
    defaultValues,
  });

  return (
    <Stack flexDirection="column" gap={7} whiteSpace="pre-wrap">
      <Header title={t('title')} subtitle={t('subtitle')} />
      <form id="playbook-form" onSubmit={handleSubmit(onSubmit)}>
        <Stack flexDirection="column" gap={7}>
          <Controller
            control={control}
            name="kind"
            defaultValue={OnboardingConfigKind.kyc}
            render={({ field }) => (
              <RadioSelect
                options={[
                  {
                    label: t('onboard-title'),
                    options: [
                      {
                        title: t('kyc.title'),
                        description: t('kyc.description'),
                        value: OnboardingConfigKind.kyc,
                        IconComponent: IcoUsers24,
                        disabled: org?.isLive && org?.isProdKycPlaybookRestricted,
                        disabledHint: t('kyc.disabled-tooltip'),
                      },
                      {
                        title: t('kyb.title'),
                        description: t('kyb.description'),
                        value: OnboardingConfigKind.kyb,
                        IconComponent: IcoStore24,
                        disabled: org?.isLive && org?.isProdKybPlaybookRestricted,
                        disabledHint: t('kyb.disabled-tooltip'),
                      },
                    ],
                  },
                  {
                    label: t('auth-title'),
                    options: [
                      {
                        title: t('auth.title'),
                        description: t('auth.description'),
                        value: OnboardingConfigKind.auth,
                        IconComponent: IcoShield24,
                        disabled: org?.isLive && org?.isProdAuthPlaybookRestricted,
                        disabledHint: t('auth.disabled-tooltip'),
                      },
                    ],
                  },
                  {
                    label: t('data-collection-title'),
                    options: [
                      {
                        title: t('doc-only.title'),
                        description: t('doc-only.description'),
                        value: OnboardingConfigKind.document,
                        IconComponent: IcoIdCard24,
                        disabled: org?.isLive && org?.isProdKycPlaybookRestricted,
                        disabledHint: t('doc-only.disabled-tooltip'),
                      },
                    ],
                  },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Stack>
      </form>
    </Stack>
  );
};

export default KindStep;
