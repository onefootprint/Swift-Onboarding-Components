import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import useCancelNewTab from '../../../hooks/mobile/use-cancel-new-tab';
import useNewTabStatusUpdate from '../../../hooks/mobile/use-new-tab-status-update';

const NewTabProcessing = () => {
  const { t } = useTranslation('pages.mobile.new-tab-processing');
  const cancelNewTab = useCancelNewTab();
  useNewTabStatusUpdate();

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <LoadingIndicator />
        <LinkButton onClick={cancelNewTab}>{t('cancel')}</LinkButton>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default NewTabProcessing;
