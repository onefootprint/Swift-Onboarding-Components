import { TextInput } from '@onefootprint/ui';
import Label from '@onefootprint/ui/src/components/label';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';

import isValidUrl from './utils/is-valid-url';

type FormProps = {
  onSubmit: (payload: { url: string }) => void;
};

type FormData = {
  url: string;
};

const Form = ({ onSubmit }: FormProps) => {
  const { t } = useTranslation('domain-restrictions');
  const {
    sandbox: { isSandbox },
  } = useOrgSession();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<FormData>();
  const prefix = isSandbox ? '' : 'https://';

  return (
    <form id="create-domain-restriction" onSubmit={handleSubmit(onSubmit)}>
      <Label>{t('create-dialog.title')}</Label>
      <TextInput
        autoFocus
        label={t('create-dialog.input.label') as string}
        placeholder={t('create-dialog.input.placeholder')}
        hasError={!!errors.url}
        mask={{ prefix }}
        {...register('url', {
          required: true,
          pattern: {
            value: /^\S*$/, // No spaces
            message: t('create-dialog.input.errors.no-space'),
          },
          validate: url => isValidUrl(url),
        })}
        onChange={e => {
          const input = e.target.value;
          setValue('url', prefix + input.substring(prefix.length));
        }}
        hint={errors.url?.message}
      />
    </form>
  );
};

export default Form;
