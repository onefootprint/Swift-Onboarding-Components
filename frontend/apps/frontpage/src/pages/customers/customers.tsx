import React from 'react';
import { useTranslation } from 'react-i18next';
import Banner from 'src/components/banner';
import styled, { css } from 'styled-components';

import Seo from '../../components/seo';
import FeaturedCards from './sections/featured-cards';
import Hero from './sections/hero';
import OtherCustomers from './sections/other-customers';

const CustomerStories = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers',
  });
  return (
    <>
      <Seo title={t('html-title')} description={t('html-description')} slug="/customers" />
      <Hero />
      <FeaturedCards />
      <OtherCustomers />
      <BannerSection>
        <Banner title={t('banner.title')} />
      </BannerSection>
    </>
  );
};

const BannerSection = styled.section`
  ${({ theme }) => css`
    padding: ${theme.spacing[11]} 0 ${theme.spacing[12]} 0;
  `}
`;
export default CustomerStories;
