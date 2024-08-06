import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Seo from 'src/components/seo';
import CustomersLogos from './components/customers-logos';
import FeatureGrid from './components/feature-grid';
import Table from './components/table';
import Title from './components/title';

const Compare = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.compare' });
  return (
    <>
      <Seo title={t('html-title')} description={t('html-description')} slug="/compare" />
      <Stack direction="column" align="center" justify="center">
        <Title />
        <Table />
        <FeatureGrid />
        <CustomersLogos />
      </Stack>
    </>
  );
};

export default Compare;
