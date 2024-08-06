import { PhoneInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type NameProps = {
  id: string;
  onSubmit: (newsupportPhone: string) => void;
  value?: string | null;
};

type FormData = {
  supportPhone: string;
};

const Form = ({ id, value, onSubmit }: NameProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-phone',
  });
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      supportPhone: value || '',
    },
  });

  const handleFormSubmit = (formData: FormData) => {
    onSubmit(formData.supportPhone);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id={id}>
      <PhoneInput
        autoFocus
        label={t('label')}
        {...register('supportPhone', {
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
