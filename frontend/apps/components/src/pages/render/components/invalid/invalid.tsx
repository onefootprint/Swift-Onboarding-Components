import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Invalid = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-render.invalid',
  });

  return (
    <Text color="primary" variant="body-2" testID="invalid">
      {t('title')}
    </Text>
  );
};

export default Invalid;
