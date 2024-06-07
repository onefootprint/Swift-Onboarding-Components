import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import styled, { css } from 'styled-components';

import LogoCopyAssets from './components/logo-copy-assets';

const NavigationLogo = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.header.nav',
  });
  const router = useRouter();

  const section = router.asPath.includes('/api-reference') ? 'api-reference' : 'documentation';

  return (
    <MainLinks>
      <LogoCopyAssets />
      <Line />
      <SectionTitle href={section === 'api-reference' ? API_REFERENCE_PATH : '/'}>
        {section === 'api-reference' ? t('api-reference') : t('documentation')}
      </SectionTitle>
    </MainLinks>
  );
};

const MainLinks = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
    position: relative;
    flex: 1;
    height: 100%;
  `};
`;

const SectionTitle = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    text-decoration: none;
    transition: opacity 0.2s ease-in-out;

    @media (hover: hover) {
      &:hover {
        opacity: 0.8;
      }
    }
  `}
`;

const Line = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 1px;
    background-color: ${theme.borderColor.tertiary};
    max-height: 20px;
  `};
`;

export default NavigationLogo;
