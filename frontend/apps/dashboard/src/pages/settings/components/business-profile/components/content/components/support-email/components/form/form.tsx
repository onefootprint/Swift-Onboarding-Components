import { TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type FormProps = {
  id: string;
  onSubmit: (newSupportEmail: string) => void;
  value?: string;
};

type FormData = {
  supportEmail: string;
};

const Form = ({ id, value, onSubmit }: FormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-email',
  });
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      supportEmail: value,
    },
  });

  const handleFormSubmit = (formData: FormData) => {
    onSubmit(formData.supportEmail);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id={id}>
      <TextInput
        autoFocus
        hasError={!!formState.errors.supportEmail}
        hint={formState.errors.supportEmail?.message}
        label={t('label')}
        placeholder={t('form.placeholder')}
        {...register('supportEmail', {
          required: {
            value: true,
            message: t('form.errors.required'),
          },
        })}
      />
    </form>
  );
};

export default Form;
