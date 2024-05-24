import { Container } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Banner from '../../../../components/banner';

const BannerSection = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.banner',
  });
  return (
    <StyledContainer>
      <Banner title={t('title')} />
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[11]} 0;
  `}
`;

export default BannerSection;
