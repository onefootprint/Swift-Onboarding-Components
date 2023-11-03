import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

export type NameProps = {
  id: string;
  onSubmit: (newWebsiteUrl: string) => void;
  value?: string | null;
};

type FormData = {
  websiteUrl: string;
};

const Form = ({ id, value, onSubmit }: NameProps) => {
  const { t } = useTranslation('pages.settings.business-profile.website');
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      websiteUrl: value || '',
    },
  });

  const handleFormSubmit = (formData: FormData) => {
    onSubmit(formData.websiteUrl);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} id={id}>
      <TextInput
        autoFocus
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
