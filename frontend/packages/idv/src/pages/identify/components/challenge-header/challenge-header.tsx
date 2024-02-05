import styled, { css } from '@onefootprint/styled';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import Logo from '../../../../components/logo';
import { useIdentifyMachine } from '../machine-provider';

type ChallengeHeaderProps = {
  title: string;
  subtitle?: string;
  shouldShowBack?: boolean;
};

const ChallengeHeader = ({
  title,
  subtitle,
  shouldShowBack,
}: ChallengeHeaderProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    config: { logoUrl, orgName },
    showLogo,
  } = state.context;

  const handleBack = () => {
    send({
      type: 'navigatedToPrevPage',
    });
  };

  return (
    <>
      <NavigationHeader
        leftButton={
          shouldShowBack
            ? { variant: 'back', onBack: handleBack }
            : { variant: 'close' }
        }
      />
      <ContentHeader>
        {showLogo && orgName && (
          <Logo orgName={orgName} logoUrl={logoUrl ?? undefined} />
        )}
        <HeaderTitle data-private title={title} subtitle={subtitle} />
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

export default ChallengeHeader;
