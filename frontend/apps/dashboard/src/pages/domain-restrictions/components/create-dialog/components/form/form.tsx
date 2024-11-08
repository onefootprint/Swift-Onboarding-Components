import { Form } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';

import isValidUrl from './utils/is-valid-url';

type DomainFormFormProps = {
  onSubmit: (payload: { url: string }) => void;
};

type FormData = {
  url: string;
};

const DomainForm = ({ onSubmit }: DomainFormFormProps) => {
  const { t } = useTranslation('domain-restrictions', { keyPrefix: 'create-dialog' });
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
      <Form.Field>
        <Form.Label>{t('input.label')}</Form.Label>
        <Form.Input
          autoFocus
          placeholder={t('input.placeholder')}
          hasError={!!errors.url}
          mask={{ prefix }}
          {...register('url', {
            required: true,
            pattern: {
              value: /^\S*$/, // No spaces
              message: t('input.errors.no-space'),
            },
            validate: url => isValidUrl(url),
          })}
          onChange={e => {
            const input = e.target.value;
            setValue('url', prefix + input.substring(prefix.length));
          }}
        />
        <Form.Errors>{errors.url?.message}</Form.Errors>
      </Form.Field>
    </form>
  );
};

export default DomainForm;
