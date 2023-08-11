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
import getSsnKind from '../../../../utils/ssn-utils';
import Ssn from '../../../ssn';
import useStepUp from './hooks/use-step-up';

const IdentitySection = () => {
  const { t, allT } = useTranslation('pages.confirm');
  const [editing, setEditing] = useState(false);
  const [state, send] = useCollectKycDataMachine();
  const { authToken, device, data, requirement } = state.context;
  const showRequestErrorToast = useRequestErrorToast();
  const decryptUserMutation = useDecryptUser();
  const ssnKind = getSsnKind(requirement);

  const identity: SectionItemProps[] = [];
  const ssn4 = data[IdDI.ssn4];
  const ssn4DisplayVal = getDisplayValue(ssn4);

  const ssn9 = data[IdDI.ssn9];
  const ssn9DisplayVal = getDisplayValue(ssn9);

  const isSsnEncrypted = ssn4?.scrubbed || ssn9?.scrubbed;

  if (ssnKind === 'ssn9') {
    if (ssn9DisplayVal) {
      identity.push({
        text: t('identity.ssn9'),
        subtext: ssn9DisplayVal,
      });
    } else {
      identity.push({
        text: t('identity.ssn9'),
        subtext: t('identity.ssn-skipped-subtext'),
      });
    }
  } else if (ssnKind === 'ssn4') {
    if (ssn4DisplayVal) {
      identity.push({
        text: t('identity.ssn4'),
        subtext: ssn4DisplayVal,
      });
    } else {
      identity.push({
        text: t('identity.ssn4'),
        subtext: t('identity.ssn-skipped-subtext'),
      });
    }
  }

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
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
    Object.entries(payload).forEach(([key, value = '']) => {
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

    // If the user has already decrypted their SSN, we don't need to do it again
    if (!isSsnEncrypted) {
      return;
    }

    decryptUserMutation.mutate(
      {
        authToken: stepUpAuthToken,
        fields: ssnKind === 'ssn9' ? [IdDI.ssn9] : [IdDI.ssn4],
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
