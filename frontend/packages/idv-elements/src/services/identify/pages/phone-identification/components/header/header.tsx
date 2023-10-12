import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import Logo from '../../../../components/logo';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';

type HeaderProps = {
  showLogo?: boolean;
  orgName?: string;
  logoUrl?: string;
};

const Header = ({ showLogo, orgName, logoUrl }: HeaderProps) => {
  const { t } = useTranslation('pages.phone-identification');
  const [, send] = useIdentifyMachine();

  const handleNavToPrevPage = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  return (
    <>
      <NavigationHeader
        leftButton={{
          variant: 'back',
          onBack: handleNavToPrevPage,
        }}
      />
      <ContentHeader>
        {showLogo && orgName && <Logo orgName={orgName} logoUrl={logoUrl} />}
        <HeaderTitle
          subtitle={t('subtitle')}
          sx={{ marginBottom: 8 }}
          title={t('title')}
        />
      </ContentHeader>
    </>
  );
};

const ContentHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default Header;
