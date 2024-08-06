import { TextInput, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const EncryptedInput = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  return (
    <Tooltip text={t('decrypt-first')} position="bottom">
      <TextInput data-dd-privacy="mask" size="compact" placeholder="" disabled defaultValue="•••••••••" />
    </Tooltip>
  );
};

export default EncryptedInput;
