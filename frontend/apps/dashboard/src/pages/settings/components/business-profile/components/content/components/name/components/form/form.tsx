import { TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type NameProps = {
  id: string;
  onSubmit: (newName: string) => void;
  value?: string;
};

type FormData = {
  name: string;
};

const Form = ({ id, value, onSubmit }: NameProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.name',
  });
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      name: value,
    },
  });

  const handleFormSubmit = (formData: FormData) => {
    onSubmit(formData.name);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id={id}>
      <TextInput
        autoFocus
        hasError={!!formState.errors.name}
        hint={formState.errors.name?.message}
        label={t('label')}
        placeholder={t('form.placeholder')}
        {...register('name', {
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
