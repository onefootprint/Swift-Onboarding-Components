import { Dialog, Form, Grid, useToast } from '@onefootprint/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { postOrgApiKeysMutation } from '@onefootprint/axios/dashboard';
import { getOrgRolesOptions } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { OrganizationRole } from '@onefootprint/request-types/dashboard';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';
import Loading from './components/loading';

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormData = { name: string; role: string };
const CreateDialog = ({ open, onClose }: CreateDialogProps) => {
  const { t } = useTranslation('api-keys', {
    keyPrefix: 'create',
  });
  const toast = useToast();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const showErrorToast = useRequestErrorToast();
  const invalidateQueries = useInvalidateQueries();
  const rolesQuery = useQuery(getOrgRolesOptions({ params: { kind: 'api_key' } }));

  const createApiKeyMutation = useMutation(postOrgApiKeysMutation());

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    createApiKeyMutation.mutate(
      {
        body: { name: formData.name, roleId: formData.role },
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          invalidateQueries();
          handleClose();
        },
        onError: (e: Error) => {
          showErrorToast(e);
          invalidateQueries();
        },
      },
    );
  };

  return (
    <Dialog
      aria-label={t('form.dialog-aria')}
      title={t('title')}
      primaryButton={{
        form: 'create-secret-key-form',
        label: t('cta.label'),
        loading: createApiKeyMutation.isPending,
        loadingAriaLabel: t('cta.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createApiKeyMutation.isPending,
        label: t('cancel'),
        onClick: handleClose,
      }}
      onClose={handleClose}
      open={open}
    >
      <form id="create-secret-key-form" onSubmit={handleSubmit(handleBeforeSubmit)} aria-label={t('form.aria')}>
        <Grid.Container columns={['2fr', '1fr']} gap={5}>
          <Grid.Item className="flex-1 min-w-0">
            <Form.Field>
              <Form.Label>{t('form.name.label')}</Form.Label>
              <Form.Input
                autoFocus
                hasError={!!errors.name}
                placeholder={t('form.name.placeholder')}
                {...register('name', {
                  required: {
                    value: true,
                    message: t('form.name.errors.required'),
                  },
                })}
              />
              <Form.Errors>{errors.name?.message}</Form.Errors>
            </Form.Field>
          </Grid.Item>
          {rolesQuery.isPending && (
            <Grid.Item className="flex-1 min-w-0">
              <Loading />
            </Grid.Item>
          )}
          <Grid.Item className="flex-1 min-w-0">
            <Form.Field>
              <Form.Label>{t('form.access-control.label')}</Form.Label>
              <Form.Select
                {...register('role', { required: t('form.access-control.errors.required') })}
                defaultValue={rolesQuery.data?.data.find((role: OrganizationRole) => role.name === 'Member')?.id}
              >
                {rolesQuery.data?.data.map((role: OrganizationRole) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Errors>{errors.role?.message}</Form.Errors>
            </Form.Field>
          </Grid.Item>
        </Grid.Container>
      </form>
    </Dialog>
  );
};

export default CreateDialog;
