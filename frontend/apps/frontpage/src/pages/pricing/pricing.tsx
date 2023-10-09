import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { Container, Stack } from '@onefootprint/ui';
import router from 'next/router';
import React, { useState } from 'react';

import ContactDialog from '../../components/contact-dialog';
import SEO from '../../components/seo';
import Heading from './components/heading';
import PenguinBanner from './components/penguin-banner';
import PricingCard from './components/pricing-card/pricing-card';

const identifyItems = [
  { key: 'kyc', subtitle: true },
  {
    key: 'id-verification',
    subtitle: true,
  },
  {
    key: 'one-click',
    subtitle: false,
  },
  {
    key: 'kyb',
    subtitle: true,
  },
  {
    key: 'hosted',
    subtitle: false,
  },
  {
    key: 'app-clip',
    subtitle: false,
  },
  {
    key: 'behavioral',
    subtitle: false,
  },
  {
    key: 'email',
    subtitle: false,
  },
];
const secureItems = [
  { key: 'pii', subtitle: false },
  {
    key: 'custom',
    subtitle: true,
  },
  {
    key: 'vault-proxy',
    subtitle: false,
  },
];
const authItems = [
  { key: 'passkeys', subtitle: false },
  {
    key: 'sms',
    subtitle: false,
  },
  {
    key: 'social',
    subtitle: false,
  },
];
const amlItems = [
  {
    key: 'ofac',
    subtitle: true,
  },
  {
    key: 'media',
    subtitle: true,
  },
];

const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const Pricing = () => {
  const { t } = useTranslation('pages.pricing');
  const [showDialog, setShowDialog] = useState(false);
  const handleClickTrigger = () => {
    setShowDialog(true);
  };
  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <SEO title={t('html-title')} slug="/pricing" />
      <Container>
        <Heading title={t('hero.title')} subtitle={t('hero.subtitle')} />
      </Container>
      <Container
        sx={{
          marginTop: 10,
          marginBottom: 9,
        }}
      >
        <Stack direction="column" gap={5} align="center">
          <PricingCard
            title={t('identify.title')}
            subtitle={t('identify.subtitle')}
            items={identifyItems.map(item => ({
              title: t(`identify.items.${item.key}.title`),
              subtitle: item.subtitle
                ? t(`identify.items.${item.key}.subtitle`)
                : undefined,
            }))}
            illustrationSrc="/pricing/identify.png"
          />
          <PricingCard
            title={t('secure.title')}
            subtitle={t('secure.subtitle')}
            items={secureItems.map(item => ({
              title: t(`secure.items.${item.key}.title`),
              subtitle: item.subtitle
                ? t(`secure.items.${item.key}.subtitle`)
                : undefined,
            }))}
            illustrationSrc="/pricing/vault.png"
          />
          <PricingCard
            title={t('aml.title')}
            subtitle={t('aml.subtitle')}
            items={amlItems.map(item => ({
              title: t(`aml.items.${item.key}.title`),
              subtitle: item.subtitle
                ? t(`aml.items.${item.key}.subtitle`)
                : undefined,
            }))}
            illustrationSrc="/pricing/aml.png"
          />
          <PricingCard
            title={t('auth.title')}
            subtitle={t('auth.subtitle')}
            items={authItems.map(item => ({
              title: t(`auth.items.${item.key}.title`),
              subtitle: item.subtitle
                ? t(`auth.items.${item.key}.subtitle`)
                : undefined,
            }))}
            illustrationSrc="/pricing/auth.png"
          />
        </Stack>
      </Container>
      <PenguinBanner
        title={t('banner.title')}
        subtitle={t('banner.subtitle')}
        primaryButton={t('banner.schedule-call')}
        secondaryButton={t('banner.get-started')}
        onClickPrimaryButton={handleClickTrigger}
        onClickSecondaryButton={() =>
          router.push(`${DASHBOARD_BASE_URL}/sign-up`)
        }
      />
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </>
  );
};

export default Pricing;
