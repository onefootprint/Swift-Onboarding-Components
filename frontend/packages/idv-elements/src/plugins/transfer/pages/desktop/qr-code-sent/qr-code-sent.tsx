import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import { useGetD2PStatus } from '../../../../../hooks';
import useCancelD2P from '../../../hooks/desktop/use-cancel-d2p';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import useHandleD2PStatusUpdate from '../../../hooks/desktop/use-handle-d2p-status-update';
import useTranslationSourceForRequirements from '../../../hooks/desktop/use-translation-source-for-requirements';

const QRCodeSent = () => {
  const { t } = useTranslation('pages.desktop.qr-code-sent');
  const translationSource = useTranslationSourceForRequirements();
  const [state] = useDesktopMachine();
  const { scopedAuthToken } = state.context;
  const cancelD2P = useCancelD2P();
  const { handleSuccess, handleError } = useHandleD2PStatusUpdate();
  useGetD2PStatus({
    authToken: scopedAuthToken ?? '',
    options: {
      onSuccess: handleSuccess,
      onError: handleError,
    },
  });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
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

export default QRCodeSent;
