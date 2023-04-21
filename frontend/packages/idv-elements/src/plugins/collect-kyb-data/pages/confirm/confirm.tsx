import { useTranslation } from '@onefootprint/hooks';
import { useToast } from '@onefootprint/ui';
import React, { useState } from 'react';

import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import BasicDataSection from './components/basic-data-section';
import BeneficialOwnersSection from './components/beneficial-owners-section';
import BusinessAddressSection from './components/business-address-section';
import EditSheet, { EditSection } from './components/edit-sheet';

const Confirm = () => {
  const { allT, t } = useTranslation('pages.confirm.summary');
  const [state, send] = useCollectKybDataMachine();
  const { authToken, data, device } = state.context;

  const isMobile = device?.type === 'mobile';
  const [editContent, setEditContent] = useState<EditSection | undefined>();
  const { mutation, syncData } = useSyncData();
  const { isLoading } = mutation;
  const toast = useToast();

  const handleConfirm = () => {
    syncData({
      authToken,
      data,
      speculative: false,
      onSuccess: () => {
        send({
          type: 'confirmed',
        });
      },
      onError: (error: unknown) => {
        toast.show({
          title: allT('pages.sync-data-error.title'),
          description: allT('pages.sync-data-error.description'),
          variant: 'error',
        });
        console.error(error);
      },
    });
  };

  const handlePrev = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  const handleBasicInfoEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.basicData);
    } else {
      send({ type: 'editBasicData' });
    }
  };

  const handleAddressEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.businessAddress);
    } else {
      send({ type: 'editBusinessAddress' });
    }
  };

  const handleIdentityEdit = () => {
    if (isMobile) {
      setEditContent(EditSection.beneficialOwners);
    } else {
      send({ type: 'editBeneficialOwners' });
    }
  };

  const handleCloseEdit = () => {
    setEditContent(undefined);
  };

  return (
    <>
      <ConfirmCollectedData
        title={t('title')}
        subtitle={t('subtitle')}
        cta={t('cta')}
        onClickPrev={handlePrev}
        onClickConfirm={handleConfirm}
        isLoading={isLoading}
      >
        <BasicDataSection onEdit={handleBasicInfoEdit} />
        <BusinessAddressSection onEdit={handleAddressEdit} />
        <BeneficialOwnersSection onEdit={handleIdentityEdit} />
      </ConfirmCollectedData>
      <EditSheet
        open={!!editContent}
        onClose={handleCloseEdit}
        section={editContent}
      />
    </>
  );
};

export default Confirm;
