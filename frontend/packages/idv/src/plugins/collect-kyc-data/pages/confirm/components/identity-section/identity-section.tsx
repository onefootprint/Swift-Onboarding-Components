import { IcoUserCircle24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { DecryptUserResponse } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  SectionAction,
  SectionItemProps,
} from '../../../../../../components/confirm-collected-data';
import {
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import { FPCustomEvents, sendCustomEvent } from '../../../../../../utils';
import Logger from '../../../../../../utils/logger';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useDecryptUser from '../../../../hooks/use-decrypt-user';
import type { KycData } from '../../../../utils/data-types';
import {
  getSsnKind,
  getSsnValue,
  ssnFormatter,
} from '../../../../utils/ssn-utils';
import isCountryUsOrTerritories from '../../../../utils/state-machine/utils/is-country-us-or-territories';
import Ssn from '../../../ssn';
import useStepUp from './hooks/use-step-up';

export enum SsnValue {
  skipped,
  hidden,
  revealed,
}

type SSN = ReturnType<typeof getSsnValue>;

const getSsnValueType = (ssn: SSN) => {
  if (ssn?.value) {
    return SsnValue.hidden;
  }
  return ssn?.scrubbed ? SsnValue.hidden : SsnValue.skipped;
};

const IdentitySection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages' });
  const [editing, setEditing] = useState(false);
  const [state, send] = useCollectKycDataMachine();
  const { authToken, device, data, requirement } = state.context;
  const toast = useToast();
  const decryptUserMutation = useDecryptUser();
  const ssnKind = getSsnKind(requirement);
  const ssn = getSsnValue(data, ssnKind);
  const [ssnValueType, setSsnValueType] = useState(() => getSsnValueType(ssn));
  const isUsOrTerritories = isCountryUsOrTerritories(data);

  const getIdentitiesSections = (): SectionItemProps[] => {
    if (!ssnKind) {
      return [];
    }

    const ssnDisplayVal =
      ssnValueType === SsnValue.skipped
        ? t('confirm.identity.ssn-skipped-subtext')
        : ssnFormatter(ssnKind, ssn?.value, ssnValueType === SsnValue.hidden);

    const text =
      ssnKind === 'ssn9'
        ? t('confirm.identity.ssn9')
        : t('confirm.identity.ssn4');

    return [{ text, subtext: ssnDisplayVal }];
  };

  const identity = getIdentitiesSections();

  useEffect(() => {
    if (ssn?.decrypted) {
      // If newly decrypted, want to reveal immediately
      setSsnValueType(SsnValue.revealed);
    } else {
      setSsnValueType(getSsnValueType(ssn));
    }
  }, [ssn]);

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
        // @ts-expect-error: fix-me Type 'string | string[]' is not assignable to type 'undefined'.
        value: value ?? '',
        decrypted: true,
      };
    });

    send({
      type: 'decryptedData',
      payload: decryptedData,
    });
  };

  const showErrorToast = () => {
    toast.show({
      title: t('confirm.summary.reveal-error.title'),
      description: t('confirm.summary.reveal-error.description'),
      variant: 'error',
    });
  };

  const handleStepUpSuccess = (stepUpAuthToken: string) => {
    send({
      type: 'stepUpCompleted',
      payload: {
        authToken: stepUpAuthToken,
      },
    });
    sendCustomEvent(FPCustomEvents.stepUpCompleted, {
      authToken: stepUpAuthToken,
    });

    // If the user has already decrypted their SSN, we don't need to do it again
    if (!ssn?.scrubbed) {
      return;
    }

    if (decryptUserMutation.isLoading) {
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
          Logger.error(
            `Decrypting SSN after step up failed in kyc confirm page. ${getErrorMessage(
              error,
            )}`,
            { location: 'kyc-confirm' },
          );
          showErrorToast();
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
      Logger.error(
        `useStepUp hook in kyc confirm page failed, ${getErrorMessage(error)}`,
        { location: 'kyc-confirm' },
      );
      showErrorToast();
    },
  });

  const shouldTriggerStepUp = ssn?.scrubbed && needsStepUp && canStepUp;
  const handleReveal = () => {
    if (ssn?.value) {
      setSsnValueType(SsnValue.revealed);
    } else if (shouldTriggerStepUp) {
      stepUp();
    } else {
      Logger.error(
        'Attempted to reveal SSN on confirm page when step up is not available',
        { location: 'kyc-confirm' },
      );
    }
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setEditing(true),
      actionTestID: 'identity-edit-button',
    });

    const canReveal = ssn?.value || isStepUpLoading || shouldTriggerStepUp;
    if (canReveal) {
      if (ssnValueType === SsnValue.revealed) {
        actions.unshift({
          label: t('confirm.summary.hide'),
          onClick: () => setSsnValueType(SsnValue.hidden),
          actionTestID: 'identity-hide-button',
        });
      } else {
        actions.unshift({
          label: t('confirm.summary.reveal'),
          onClick: handleReveal,
          isLoading: isStepUpLoading,
          actionTestID: 'identity-reveal-button',
        });
      }
    }
  }

  if (!isUsOrTerritories || !identity.length) {
    return null;
  }

  return (
    <Section
      title={t('confirm.identity.title')}
      actions={actions}
      IconComponent={IcoUserCircle24}
      content={getSectionContent()}
      testID="identity-section"
    />
  );
};

export default IdentitySection;
