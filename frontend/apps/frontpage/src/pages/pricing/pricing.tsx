import { Container, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import SEO from '../../components/seo';
import CustomBanner from './components/custom-banner';
import Heading from './components/heading';
import PlansTable from './components/plans-table';

const Pricing = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/pricing" />
      <Container>
        <Stack direction="column" align="center" justify="center" gap={9} paddingTop={9}>
          <Heading title={t('hero.title')} subtitle={t('hero.subtitle')} />
          <PlansTable />
          <CustomBanner
            title={t('banner.title')}
            subtitle={t('banner.subtitle')}
            primaryButton={t('banner.schedule-call')}
            secondaryButton={t('banner.get-started')}
          />
        </Stack>
      </Container>
    </>
  );
};

export default Pricing;
