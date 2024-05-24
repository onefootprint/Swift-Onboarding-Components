import React from 'react';
import { useTranslation } from 'react-i18next';
import Banner from 'src/components/banner';
import styled, { css } from 'styled-components';

import FeaturedCards from './sections/featured-cards';
import Hero from './sections/hero';
import OtherCustomers from './sections/other-customers';

const CustomerStories = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers.banner',
  });
  return (
    <>
      <Hero />
      <FeaturedCards />
      <OtherCustomers />
      <BannerSection>
        <Banner title={t('title')} />
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
