import { Dialog, Form, Stack, Text, TextArea } from '@onefootprint/ui';
import noop from 'lodash/noop';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type NoOtherBosProps = {
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

const NoOtherBosDialog = ({ isLoading, isOpen, onClose, onSubmit }: NoOtherBosProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.form' });
  const methods = useForm<{ note: string }>({ defaultValues: { note: '' } });
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = methods;

  const onSubmitFormData = ({ note }: { note: string }) => {
    onSubmit(note);
    reset();
  };

  const handleOnClose = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  return (
    <Dialog
      isConfirmation
      title={t('missing-bos-confirmation.title')}
      open={isOpen}
      onClose={isLoading ? noop : handleOnClose}
      secondaryButton={{
        label: t('missing-bos-confirmation.secondary-cta'),
        loading: isLoading,
        onClick: handleOnClose,
      }}
      primaryButton={{
        type: 'submit',
        form: 'no-other-bos-form',
        label: t('missing-bos-confirmation.primary-cta'),
        loading: isLoading,
      }}
    >
      <form id="no-other-bos-form" onSubmit={handleSubmit(onSubmitFormData)}>
        <Stack direction="column" gap={7}>
          <Text variant="body-2" textAlign="center">
            {t('missing-bos-confirmation.description')}
          </Text>
          <Form.Field>
            <Form.Label htmlFor="no-other-bos-note">{t('missing-bos-confirmation.input-label')}</Form.Label>
            <TextArea
              id="no-other-bos-note"
              placeholder={t('missing-bos-confirmation.input-placeholder')}
              {...register('note', { required: false })}
            />
            <Form.Errors>{errors.note?.message}</Form.Errors>
          </Form.Field>
        </Stack>
      </form>
    </Dialog>
  );
};

export default NoOtherBosDialog;
