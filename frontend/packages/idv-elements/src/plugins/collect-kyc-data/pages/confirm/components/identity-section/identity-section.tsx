import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { DecryptUserResponse } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import React, { useEffect, useState } from 'react';

import type {
  SectionAction,
  SectionItemProps,
} from '../../../../../../components/confirm-collected-data';
import {
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useDecryptUser from '../../../../hooks/use-decrypt-user';
import type { KycData } from '../../../../utils/data-types';
import {
  getSsnKind,
  getSsnValue,
  ssnFormatter,
} from '../../../../utils/ssn-utils';
import isInDomesticFlow from '../../../../utils/state-machine/utils/is-in-domestic-flow';
import Ssn from '../../../ssn';
import useStepUp from './hooks/use-step-up';

export enum SsnValue {
  skipped,
  hidden,
  revealed,
}

const IdentitySection = () => {
  const { t, allT } = useTranslation('pages.confirm');
  const [editing, setEditing] = useState(false);
  const [state, send] = useCollectKycDataMachine();
  const { authToken, device, data, requirement } = state.context;
  const showRequestErrorToast = useRequestErrorToast();
  const decryptUserMutation = useDecryptUser();
  const ssnKind = getSsnKind(requirement);
  const ssn = getSsnValue(data, ssnKind);
  const isDomestic = isInDomesticFlow(data);

  const getSsnValueType = () => {
    if (ssn?.value) {
      return SsnValue.hidden;
    }
    return ssn?.scrubbed ? SsnValue.hidden : SsnValue.skipped;
  };
  const [ssnValueType, setSsnValueType] = useState(getSsnValueType());

  useEffect(() => {
    if (ssn?.decrypted) {
      // If newly decrypted, want to reveal immediately
      setSsnValueType(SsnValue.revealed);
    } else {
      setSsnValueType(getSsnValueType());
    }
  }, [ssn]);

  const identity: SectionItemProps[] = [];
  if (ssnKind) {
    let ssnDisplayVal: string | undefined;
    if (ssnValueType === SsnValue.skipped) {
      ssnDisplayVal = t('identity.ssn-skipped-subtext');
    } else {
      ssnDisplayVal = ssnFormatter(
        ssnKind,
        ssn?.value,
        ssnValueType === SsnValue.hidden,
      );
    }
    identity.push({
      text: ssnKind === 'ssn9' ? t('identity.ssn9') : t('identity.ssn4'),
      subtext: ssnDisplayVal,
    });
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
    Object.entries(payload).forEach(([key, value]) => {
      decryptedData[key as IdDI] = {
        value: (value as any) ?? '',
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
    if (!ssn?.scrubbed) {
      return;
    }

    decryptUserMutation.mutate(
      {
        authToken: stepUpAuthToken,
        fields: ssnKind === 'ssn9' ? [IdDI.ssn9] : [IdDI.ssn4],
      },
      {
        onSuccess: handleDecryptSuccess,
        onError: (error: unknown) => {
          console.error(
            'Decrypting SSN after step up failed in kyc confirm page',
            getErrorMessage(error),
          );
          showRequestErrorToast(error);
        },
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
    onError: (error: unknown) => {
      console.error(
        'useStepUp hook in kyc confirm page failed',
        getErrorMessage(error),
      );
      showRequestErrorToast(error);
    },
  });

  const shouldTriggerStepUp = ssn?.scrubbed && needsStepUp && canStepUp;
  const handleReveal = () => {
    if (ssn?.value) {
      setSsnValueType(SsnValue.revealed);
    } else if (shouldTriggerStepUp) {
      stepUp();
    } else {
      console.error(
        'Attempted to reveal SSN on confirm page when step up is not available',
      );
    }
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('pages.confirm.summary.edit'),
      onClick: () => setEditing(true),
      actionTestID: 'identity-edit-button',
    });

    const canReveal = ssn?.value || isStepUpLoading || shouldTriggerStepUp;
    if (canReveal) {
      if (ssnValueType === SsnValue.revealed) {
        actions.unshift({
          label: allT('pages.confirm.summary.hide'),
          onClick: () => setSsnValueType(SsnValue.hidden),
          actionTestID: 'identity-hide-button',
        });
      } else {
        actions.unshift({
          label: allT('pages.confirm.summary.reveal'),
          onClick: handleReveal,
          isLoading: isStepUpLoading,
          actionTestID: 'identity-reveal-button',
        });
      }
    }
  }

  if (!isDomestic || !identity.length) {
    return null;
  }

  return (
    <Section
      title={t('identity.title')}
      actions={actions}
      IconComponent={IcoUserCircle24}
      content={getSectionContent()}
      testID="identity-section"
    />
  );
};

export default IdentitySection;
