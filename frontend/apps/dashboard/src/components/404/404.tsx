import { Box, EmptyState } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const Page404 = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.404' });

  return (
    <Box marginTop={12}>
      <EmptyState
        title={t('title')}
        description={t('description')}
        renderHeader={() => <Image alt={t('image.alt')} height={212.62} src="/404.svg" width={298} priority />}
      />
    </Box>
  );
};

export default Page404;
