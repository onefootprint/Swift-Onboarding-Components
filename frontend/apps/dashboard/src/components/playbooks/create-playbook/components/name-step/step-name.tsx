import type { ObConfigurationKind } from '@onefootprint/request-types/dashboard';
import { Form, Stack } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Header from '../header';

import useDefaultName from './hooks/use-default-name';

export type NameFormData = {
  name: string;
};

export type NameStepProps = {
  defaultValues: NameFormData;
  meta: {
    kind: ObConfigurationKind;
  };
  onBack: () => void;
  onSubmit: (data: NameFormData) => void;
};

const NameStep = ({ defaultValues, meta, onBack, onSubmit }: NameStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.name' });
  const defaultName = useDefaultName({ kind: meta.kind });
  const formMethods = useForm<NameFormData>({
    defaultValues: {
      name: defaultValues.name || defaultName,
    },
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods;

  return (
    <Stack direction="column" gap={7} width="520px" whiteSpace="pre-wrap">
      <form
        id="playbook-form"
        onSubmit={handleSubmit(onSubmit)}
        onReset={event => {
          event.preventDefault();
          onBack();
        }}
      >
        <Stack direction="column" gap={7}>
          <Header title={t('title')} subtitle={t('subtitle')} />
          <Stack direction="column" gap={2}>
            <Form.Field>
              <Form.Label>{t('form.name.label')}</Form.Label>
              <Form.Input
                autoFocus
                hasError={!!errors.name}
                placeholder={defaultName}
                {...register('name', {
                  required: t('form.name.errors.required'),
                })}
              />
              <Form.Errors>{errors.name?.message}</Form.Errors>
            </Form.Field>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
};

export default NameStep;
