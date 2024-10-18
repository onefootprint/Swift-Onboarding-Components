import { Dialog, Stack, Text, TextArea } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type NoOtherBosProps = {
  onClose: () => void;
  open: boolean;
};

const MoreBos = ({ onClose, open }: NoOtherBosProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form',
  });

  return (
    <Dialog
      isConfirmation
      title={t('under-100.title')}
      open={open}
      onClose={onClose}
      primaryButton={{
        label: t('under-100.primary-cta'),
        onClick: onClose,
      }}
      secondaryButton={{
        label: t('under-100.secondary-cta'),
        onClick: onClose,
      }}
    >
      <Stack direction="column" gap={7}>
        <Text variant="body-2" textAlign="center">
          {t('under-100.description')}
        </Text>
        <TextArea label={t('under-100.input-label')} placeholder={t('under-100.input-placeholder')} />
      </Stack>
    </Dialog>
  );
};

export default MoreBos;
