import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Container, Stack } from '@onefootprint/ui';
import router from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContactDialog from '../../components/contact-dialog';
import SEO from '../../components/seo';
import Heading from './components/heading';
import PenguinBanner from './components/penguin-banner';
import PlansTable from './components/plans-table';

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const Pricing = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });
  const [showDialog, setShowDialog] = useState(false);
  const handleClickTrigger = () => {
    setShowDialog(true);
  };
  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <SEO
        title={t('html-title')}
        description={t('html-description')}
        slug="/pricing"
      />
      <Container>
        <Stack direction="column" align="center" justify="center" gap={9}>
          <Heading title={t('hero.title')} subtitle={t('hero.subtitle')} />
          <PlansTable />
          <PenguinBanner
            title={t('banner.title')}
            subtitle={t('banner.subtitle')}
            primaryButton={t('banner.schedule-call')}
            secondaryButton={t('banner.get-started')}
            onClickPrimaryButton={handleClickTrigger}
            onClickSecondaryButton={() =>
              router.push(`${DASHBOARD_BASE_URL}/authentication/sign-up`)
            }
          />
        </Stack>
      </Container>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </>
  );
};

export default Pricing;
