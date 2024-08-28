import { Box, Form, Text } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData, StepProps } from 'src/pages/proxy-configs/proxy-configs.types';

const BasicConfiguration = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.create.form.basic-configuration',
  });
  const { handleSubmit, register, formState } = useForm<FormData>({
    defaultValues: {
      name: values.name,
      accessReason: values.accessReason,
      method: values.method,
      url: values.url,
    },
  });

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Text variant="label-2" marginBottom={5}>
        {t('title')}
      </Text>
      <Box gap={7} display="grid">
        <Form.Field>
          <Form.Label htmlFor="name">{t('name.label')}</Form.Label>
          <Form.Input
            id="name"
            autoFocus
            placeholder={t('name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('name.errors.required'),
              },
            })}
          />
          <Form.Errors>{formState.errors.name?.message}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <Form.Label htmlFor="url">{t('url.label')}</Form.Label>
          <Form.Input
            id="url"
            placeholder={t('url.placeholder')}
            type="url"
            {...register('url', {
              required: {
                value: true,
                message: t('url.errors.required'),
              },
            })}
          />
          <Form.Errors>{formState.errors.url?.message}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <Form.Label htmlFor="method">{t('method.label')}</Form.Label>
          <Form.Select
            id="method"
            {...register('method', {
              required: {
                value: true,
                message: t('method.errors.required'),
              },
            })}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </Form.Select>
        </Form.Field>
        <Form.Field>
          <Form.Label htmlFor="accessReason">{t('access-reason.label')}</Form.Label>
          <Form.Input
            id="accessReason"
            placeholder={t('access-reason.placeholder')}
            {...register('accessReason', {
              required: {
                value: true,
                message: t('access-reason.errors.required'),
              },
            })}
          />
          <Form.Errors>{formState.errors.accessReason?.message}</Form.Errors>
        </Form.Field>
      </Box>
    </form>
  );
};

export default BasicConfiguration;
