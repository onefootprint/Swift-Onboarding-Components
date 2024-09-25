import { TextInput, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const EncryptedInput = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'edit' });
  return (
    <Tooltip text={t('decrypt-first')} position="bottom">
      <TextInput data-dd-privacy="mask" size="compact" placeholder="" disabled defaultValue="•••••••••" />
    </Tooltip>
  );
};

export default EncryptedInput;
