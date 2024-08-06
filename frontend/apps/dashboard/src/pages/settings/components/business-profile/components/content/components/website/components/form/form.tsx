import { TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type WebsiteProps = {
  id: string;
  onSubmit: (newWebsiteUrl: string) => void;
  value?: string | null;
};

type FormData = {
  websiteUrl: string;
};

const Form = ({ id, value, onSubmit }: WebsiteProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.website',
  });
  const { register, handleSubmit, formState } = useForm<FormData>({
    defaultValues: {
      websiteUrl: value || '',
    },
  });
  const handleFormSubmit = async (formData: FormData) => {
    onSubmit(formData.websiteUrl);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id={id}>
      <TextInput
        autoFocus
        hasError={!!formState.errors.websiteUrl}
        hint={formState.errors.websiteUrl?.message}
        label={t('label')}
        placeholder={t('form.placeholder')}
        type="url"
        {...register('websiteUrl', {
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
