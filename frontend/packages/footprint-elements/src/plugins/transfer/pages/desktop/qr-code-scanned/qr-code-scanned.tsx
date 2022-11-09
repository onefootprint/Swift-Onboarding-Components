import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../components/header-title';
import NavigationHeader from '../../../../../components/navigation-header';
import { useGetD2PStatus } from '../../../../../hooks';
import useCancelD2P from '../../../hooks/desktop/use-cancel-d2p';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useTranslationSourceForRequirements from '../../../hooks/desktop/use-translation-source-for-requirements';

const QRCodeScanned = () => {
  const [state] = useDesktopMachine();
  const { scopedAuthToken } = state.context;
  const { t } = useTranslation('pages.desktop.qr-code-scanned');
  const translationSource = useTranslationSourceForRequirements();
  const cancelD2P = useCancelD2P();
  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus(true, scopedAuthToken ?? '', {
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t(`${translationSource}.title`)}
          subtitle={t('subtitle')}
        />
        <LoadingIndicator />
        <LinkButton onClick={cancelD2P}>{t('cancel')}</LinkButton>
      </Container>
    </>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[7]};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `}
`;

export default QRCodeScanned;
