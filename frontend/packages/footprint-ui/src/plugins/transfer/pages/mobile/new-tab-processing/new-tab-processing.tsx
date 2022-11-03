import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../components/header-title';
import NavigationHeader from '../../../../../components/navigation-header';
import useCancelNewTab from '../../../hooks/mobile/use-cancel-new-tab';
import useNewTabStatusUpdate from '../../../hooks/mobile/use-new-tab-status-update';

const NewTabProcessing = () => {
  const { t } = useTranslation('pages.mobile.new-tab-processing');
  const cancelNewTab = useCancelNewTab();
  useNewTabStatusUpdate();

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
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
