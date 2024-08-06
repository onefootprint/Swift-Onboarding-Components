import { HeaderTitle } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const InvalidUrl = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.invalid-url' });
  return (
    <Box paddingTop={8}>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </Box>
  );
};

export default InvalidUrl;
