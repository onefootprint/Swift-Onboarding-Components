import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { DecryptUserResponse, IdDI } from '@onefootprint/types';
import React, { useState } from 'react';

import {
  type SectionItemProps,
  Section,
  SectionAction,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useDecryptUser from '../../../../hooks/use-decrypt-user';
import { getDisplayValue, KycData } from '../../../../utils/data-types';
import Ssn from '../../../ssn';
import useStepUp from './hooks/use-step-up';

const IdentitySection = () => {
  const { t, allT } = useTranslation('pages.confirm');
  const [editing, setEditing] = useState(false);
  const [state, send] = useCollectKycDataMachine();
  const { authToken, device, data } = state.context;
  const showRequestErrorToast = useRequestErrorToast();
  const decryptUserMutation = useDecryptUser();

  const identity = [];
  const ssn9 = data[IdDI.ssn9];
  const ssn9DisplayVal = getDisplayValue(ssn9);

  const ssn4 = data[IdDI.ssn4];
  const ssn4DisplayVal = getDisplayValue(ssn4);

  if (ssn9DisplayVal) {
    identity.push({
      text: t('identity.ssn9'),
      subtext: ssn9DisplayVal,
    });
  } else if (ssn4DisplayVal) {
    identity.push({
      text: t('identity.ssn4'),
      subtext: ssn4DisplayVal,
    });
  }

  const stopEditing = () => {
    setEditing(false);
  };

  const identityItems = identity.map(
    ({ text, subtext, textColor }: SectionItemProps) => (
      <SectionItem
        key={text}
        text={text}
        subtext={subtext}
        textColor={textColor}
      />
    ),
  );

  const getSectionContent = () => {
    if (!editing) {
      return identityItems;
    }
    return (
      <Ssn
        onCancel={stopEditing}
        onComplete={stopEditing}
        hideHeader
        hideDisclaimer
      />
    );
  };

  const handleDecryptSuccess = (payload: DecryptUserResponse) => {
    const decryptedData: KycData = {};
    Object.entries(payload).forEach(([key, value]) => {
      decryptedData[key as IdDI] = {
        value,
        decrypted: true,
      };
    });

    send({
      type: 'decryptedData',
      payload: decryptedData,
    });
  };

  const handleStepUpSuccess = (stepUpAuthToken: string) => {
    send({
      type: 'stepUpCompleted',
      payload: {
        authToken: stepUpAuthToken,
      },
    });

    const fields = ssn9DisplayVal ? [IdDI.ssn9] : [IdDI.ssn4];
    decryptUserMutation.mutate(
      {
        authToken: stepUpAuthToken,
        fields,
      },
      {
        onSuccess: handleDecryptSuccess,
        onError: showRequestErrorToast,
      },
    );
  };

  const {
    needsStepUp,
    canStepUp,
    stepUp,
    isLoading: isStepUpLoading,
  } = useStepUp({
    authToken,
    device,
    onSuccess: handleStepUpSuccess,
    onError: showRequestErrorToast,
  });

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('pages.confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  const isSsnEncrypted = ssn4?.scrubbed || ssn9?.scrubbed;
  const shouldShowReveal = isSsnEncrypted && needsStepUp && canStepUp;
  if (isStepUpLoading || shouldShowReveal) {
    actions.unshift({
      label: allT('pages.confirm.summary.reveal'),
      onClick: stepUp,
      isLoading: isStepUpLoading,
    });
  }

  return identity.length ? (
    <Section
      title={t('identity.title')}
      actions={actions}
      IconComponent={IcoUserCircle24}
      content={getSectionContent()}
      testID="identity-section"
    />
  ) : null;
};

export default IdentitySection;
