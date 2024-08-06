import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const VerifySuccess = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.verify.success' });

  return (
    <>
      <Text color="primary" variant="heading-3" marginBottom={5}>
        {t('title')}
      </Text>
      <Text color="secondary" variant="body-2">
        {t('description')}
      </Text>
    </>
  );
};

export default VerifySuccess;
