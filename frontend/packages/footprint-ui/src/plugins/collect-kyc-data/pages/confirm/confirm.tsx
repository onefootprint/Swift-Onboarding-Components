import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../components/navigation-header';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import IdentitySection from './components/identity-section';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm');
  return (
    <>
      <NavigationHeader />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <SectionsContainer>
          <BasicInfoSection />
          <AddressSection />
          <IdentitySection />
        </SectionsContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

const SectionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default Confirm;
