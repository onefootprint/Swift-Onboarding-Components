import { useTranslation } from 'react-i18next';
import Banner from 'src/components/banner';
import styled, { css } from 'styled-components';

import SEO from '../../../components/seo';
import DeveloperExperience from '../components/developer-experience';
import Hero from './sections/hero';
import IdentifyBos from './sections/identify-bos/indentify-bos';
import IdentifyBusinesses from './sections/identify-businesss';
import SecurelyStore from './sections/securely-store';

const KYB = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyb' });

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/platform/kyb" />
      <BackgroundGradient />
      <Hero />
      <IdentifyBusinesses />
      <IdentifyBos />
      <SecurelyStore />
      <DeveloperExperience />
      <Banner title={t('banner.title')} imgSrc="/kyb/penguin-banner/kyb.svg" />
    </>
  );
};

const BackgroundGradient = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 50%
    );
  `}
`;

export default KYB;
