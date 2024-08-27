import { RoleKind } from '@onefootprint/types';
import { Dialog, Form, Grid, useToast } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useRoles from 'src/hooks/use-roles/use-roles';
import styled from 'styled-components';

import Loading from './components/loading';
import useCreateApiKey from './hooks/use-create-api-key';

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormData = { name: string; role: { label: string; value: string } };
const CreateDialog = ({ open, onClose }: CreateDialogProps) => {
  const createApiKeyMutation = useCreateApiKey();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.api-keys.create',
  });
  const toast = useToast();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const rolesQuery = useRoles(RoleKind.apiKey);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const data = { name: formData.name, roleId: formData.role.value };
    createApiKeyMutation.mutate(data, {
      onSuccess: () => {
        toast.show({
          title: t('feedback.success.title'),
          description: t('feedback.success.description'),
        });
        handleClose();
      },
    });
  };

  return (
    <Dialog
      aria-label={t('form.dialog-aria')}
      title={t('title')}
      primaryButton={{
        form: 'create-secret-key-form',
        label: t('cta.label'),
        loading: createApiKeyMutation.isLoading,
        loadingAriaLabel: t('cta.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createApiKeyMutation.isLoading,
        label: t('cancel'),
        onClick: handleClose,
      }}
      onClose={handleClose}
      open={open}
    >
      <form id="create-secret-key-form" onSubmit={handleSubmit(handleBeforeSubmit)} aria-label={t('form.aria')}>
        <Grid.Container columns={['2fr', '1fr']} gap={5}>
          <StyledGridItem>
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
          </StyledGridItem>
          {rolesQuery.isLoading && (
            <StyledGridItem>
              <Loading />
            </StyledGridItem>
          )}
          <StyledGridItem>
            <Form.Field>
              <Form.Label>{t('form.access-control.label')}</Form.Label>
              <Form.Select
                {...register('role', { required: t('form.access-control.errors.required') })}
                defaultValue={rolesQuery.data?.find(role => role.name === 'Member')?.id}
              >
                {rolesQuery.data?.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Errors>{errors.role?.message}</Form.Errors>
            </Form.Field>
          </StyledGridItem>
        </Grid.Container>
      </form>
    </Dialog>
  );
};

const StyledGridItem = styled(Grid.Item)`
  flex: 1;
  min-width: 0;
`;

export default CreateDialog;
