import { useTranslation } from '@onefootprint/hooks';
import { Button, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import AddressSection from './components/address-section';
import BasicInfoSection from './components/basic-info-section';
import EditSheet, { EditSection } from './components/edit-sheet';
import IdentitySection from './components/identity-section';

const Confirm = () => {
  const { t } = useTranslation('pages.confirm');
  const [state, send] = useCollectKycDataMachine();
  const { authToken, data, device } = state.context;
  const isMobile = device?.type === 'mobile';
  const [editContent, setEditContent] = useState<EditSection | undefined>();
  const { mutation, syncData } = useSyncData();

  const toast = useToast();

  const handleError = () => {
    toast.show({
      title: t('error.title'),
      description: t('error.description'),
      variant: 'error',
    });
  };

  const handleSyncSuccess = () => {
    send({
      type: Events.confirmed,
    });
  };

  const handleConfirm = () => {
    if (!authToken) {
      return;
    }
    syncData(authToken, data, {
      speculative: false,
      onSuccess: handleSyncSuccess,
      onError: handleError,
    });
  };

  const handlePrev = () => {
    send({ type: Events.navigatedToPrevPage });
  };

  const handleBasicInfoEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.basicInfo);
    } else {
      send({ type: Events.editBasicInfo });
    }
  };

  const handleAddressEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.address);
    } else {
      send({ type: Events.editAddress });
    }
  };

  const handleIdentityEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.identity);
    } else {
      send({ type: Events.editIdentity });
    }
  };

  const handleCloseEdit = () => {
    setEditContent(undefined);
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'back', onClick: handlePrev }} />
      <Container>
        <HeaderTitle
          title={t('summary.title')}
          subtitle={t('summary.subtitle')}
        />
        <SectionsContainer>
          <BasicInfoSection onEdit={handleBasicInfoEdit} />
          <AddressSection onEdit={handleAddressEdit} />
          <IdentitySection onEdit={handleIdentityEdit} />
        </SectionsContainer>
        <Button fullWidth onClick={handleConfirm} loading={mutation.isLoading}>
          {t('summary.cta')}
        </Button>
      </Container>
      <EditSheet
        open={!!editContent}
        onClose={handleCloseEdit}
        section={editContent}
      />
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[8]};
  `}
`;

const SectionsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default Confirm;
